import { getApiKey } from "../modules/ChromeStorage";
import { createUrl, fetchNextPage } from "./apis/YouTubeDataApi";
import { createFetchedComments } from "./entities/FetchedComments";

if (!chrome.runtime.onMessage.hasListeners()) {
  // MODEL

  type WithVideoId = { state: "with-video-id"; videoId: VideoId };
  type WithPageToken = {
    state: "with-page-token";
    videoId: VideoId;
    pageToken: string;
    fetchedSeconds: FetchedComments;
    totalCount: number;
    viewProps?: ViewProps;
  };
  type LastPageLoaded = {
    state: "last-page-loaded";
    videoId: VideoId;
    fetchedSeconds: FetchedComments;
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
    if (model.state === "with-page-token") {
      sendResponse({
        type: "page",
        data: model.fetchedSeconds,
        totalCount: model.totalCount,
        isLast: false,
      });
    } else {
      sendResponse({
        type: "page",
        data: model.fetchedSeconds,
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

  const onFirstPage = async () => {
    const pageResult = await fetchNextPage(
      createUrl(model.videoId, (await getApiKey()) as ApiKey),
      0
    );
    if (pageResult === "comments-disabled") {
      model = {
        state: "last-page-loaded",
        videoId: model.videoId,
        fetchedSeconds: { comments: [], secondCommentIndexPairs: [] },
        totalCount: 0,
      };
    }
    if (typeof pageResult === "string") {
      sendErrorResponse(pageResult);
      return;
    }
    const fetchedSeconds = createFetchedComments(pageResult.comments);
    model = pageResult.pageToken
      ? {
          state: "with-page-token",
          videoId: model.videoId,
          fetchedSeconds,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
        }
      : {
          state: "last-page-loaded",
          videoId: model.videoId,
          fetchedSeconds,
          totalCount: pageResult.totalCount,
        };
    sendPageResponse(model);
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
      onFirstPage();
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
    const fetchedSeconds = createFetchedComments([
      ...model.fetchedSeconds.comments,
      ...pageResult.comments,
    ]);
    const viewProps = model.viewProps;
    model = pageResult.pageToken
      ? {
          state: "with-page-token",
          videoId: model.videoId,
          fetchedSeconds,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
          viewProps,
        }
      : {
          state: "last-page-loaded",
          videoId: model.videoId,
          fetchedSeconds,
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
