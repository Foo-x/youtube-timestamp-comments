import { getApiKey } from "../modules/ChromeStorage";
import { createUrl, fetchNextPage } from "./apis/YouTubeDataApi";

if (!chrome.runtime.onMessage.hasListeners()) {
  // MODEL

  type WithVideoId = { state: "with-video-id"; videoId: VideoId };
  type WithPageToken = {
    state: "with-page-token";
    videoId: VideoId;
    pageToken: string;
    s2c: Second2Comments;
    totalCount: number;
    viewProps?: ViewProps;
  };
  type LastPageLoaded = {
    state: "last-page-loaded";
    videoId: VideoId;
    s2c: Second2Comments;
    totalCount: number;
    viewProps?: ViewProps;
  };
  type Model = WithVideoId | WithPageToken | LastPageLoaded;

  const init = (): WithVideoId => ({
    state: "with-video-id",
    videoId: new URLSearchParams(document.location.search).get("v")! as VideoId,
  });
  let model: Model = init();

  // UPDATE

  const sendResponse = (responseMsg: MsgToPA) => {
    chrome.runtime.sendMessage(responseMsg);
  };

  const sendPageResponse = (model: WithPageToken | LastPageLoaded) => {
    const s2c = Object.fromEntries(model.s2c);
    if (model.state === "with-page-token") {
      sendResponse({
        type: "page",
        data: s2c,
        totalCount: model.totalCount,
        isLast: false,
      });
    } else {
      sendResponse({
        type: "page",
        data: s2c,
        totalCount: model.totalCount,
        isLast: true,
      });
    }
  };

  const sendViewPropsResponseIfExists = (
    model: WithPageToken | LastPageLoaded
  ) => {
    if (model.viewProps !== undefined) {
      sendResponse({ type: "view-props", data: model.viewProps });
    }
  };

  const sendErrorResponse = (errorType: ErrorType) => {
    sendResponse({ type: "error", data: errorType });
  };

  const onCache = async () => {
    const newModel = init();
    if (model.videoId !== newModel.videoId) {
      model = newModel;
    }
    if (model.state === "with-video-id" && !(await getApiKey())) {
      sendErrorResponse("invalid-api-key");
      return;
    }
    if (model.state === "with-video-id") {
      update({ type: "next-page" });
      return;
    }
    sendPageResponse(model);
    sendViewPropsResponseIfExists(model);
  };

  const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

  const extractTimestampSeconds = (comment: string): number[] => {
    const timestamps = comment.match(timestampPattern);
    if (timestamps === null) {
      return [];
    }

    return Array.from(
      new Set(
        timestamps.map((timestamp) => {
          const [first, second, third] = timestamp.split(":");
          const [h, m, s] =
            third === undefined
              ? [0, parseInt(first), parseInt(second)]
              : [parseInt(first), parseInt(second), parseInt(third)];
          return h * 3600 + m * 60 + s;
        })
      )
    );
  };

  const mergeS2C = (
    oldS2C: Second2Comments,
    newS2C: Second2Comments
  ): Second2Comments => {
    const result = new Map(oldS2C.entries()) as Second2Comments;
    newS2C.forEach((comments, second) => {
      if (result.has(second)) {
        result.set(second, [...result.get(second)!, ...comments]);
        return;
      }
      result.set(second, comments);
    });
    return result;
  };

  const createS2C = (comments: string[]): Second2Comments => {
    return comments
      .map<[string, number[]]>((comment) => [
        comment,
        extractTimestampSeconds(comment),
      ])
      .map(([comment, seconds]) =>
        seconds.reduce((s2c, second) => {
          if (s2c.has(second)) {
            s2c.set(second, [...s2c.get(second)!, comment]);
            return s2c;
          }
          s2c.set(second, [comment]);
          return s2c;
        }, new Map<number, string[]>() as Second2Comments)
      )
      .reduce(mergeS2C);
  };

  const onNextPage = async () => {
    if (model.state === "last-page-loaded") {
      sendPageResponse(model);
      return;
    }
    const key = (await getApiKey()) as ApiKey | undefined;
    if (!key) {
      sendErrorResponse("invalid-api-key");
      return;
    }
    if (model.state === "with-video-id") {
      const pageResult = await fetchNextPage(createUrl(model.videoId, key), 0);
      if (pageResult === "comments-disabled") {
        model = {
          state: "last-page-loaded",
          videoId: model.videoId,
          s2c: new Map(),
          totalCount: 0,
        };
      }
      if (typeof pageResult === "string") {
        sendErrorResponse(pageResult);
        return;
      }
      const s2c = createS2C(pageResult.comments);
      model = pageResult.pageToken
        ? {
            state: "with-page-token",
            videoId: model.videoId,
            s2c,
            totalCount: pageResult.totalCount,
            pageToken: pageResult.pageToken,
          }
        : {
            state: "last-page-loaded",
            videoId: model.videoId,
            s2c,
            totalCount: pageResult.totalCount,
          };
      sendPageResponse(model);
      return;
    }

    const pageResult = await fetchNextPage(
      createUrl(model.videoId, key, model.pageToken),
      model.totalCount
    );
    if (typeof pageResult === "string") {
      sendErrorResponse(pageResult);
      return;
    }
    const s2c = mergeS2C(model.s2c, createS2C(pageResult.comments));
    const viewProps = model.viewProps;
    model = pageResult.pageToken
      ? {
          state: "with-page-token",
          videoId: model.videoId,
          s2c,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
          viewProps,
        }
      : {
          state: "last-page-loaded",
          videoId: model.videoId,
          s2c,
          totalCount: pageResult.totalCount,
          viewProps,
        };
    sendPageResponse(model);
  };

  const update = async (msg: MsgToCS) => {
    if (msg.type === "cache") {
      onCache();
      return;
    }
    if (msg.type === "next-page") {
      onNextPage();
      return;
    }
    if (
      msg.type === "save-view-props" &&
      (model.state === "with-page-token" || model.state === "last-page-loaded")
    ) {
      model.viewProps = msg.data;
      return;
    }
  };

  chrome.runtime.onMessage.addListener((message: MsgToCS) => {
    update(message);
  });
}
