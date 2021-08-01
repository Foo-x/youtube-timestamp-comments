import { getApiKey } from "../modules/ChromeStorage";

// MODEL

type WithVideoId = { state: "with-video-id"; videoId: VideoId };
type WithApiKey = { state: "with-api-key"; videoId: VideoId; key: ApiKey };
type WithPageToken = {
  state: "with-page-token";
  videoId: VideoId;
  key: ApiKey;
  pageToken: string;
  s2c: Second2Comments;
  totalCount: number;
  viewProps?: ViewProps;
};
type LastPageLoaded = {
  state: "last-page-loaded";
  videoId: VideoId;
  key: ApiKey;
  s2c: Second2Comments;
  totalCount: number;
  viewProps?: ViewProps;
};
type Model = WithVideoId | WithApiKey | WithPageToken | LastPageLoaded;

let model: Model = {
  state: "with-video-id",
  videoId: new URLSearchParams(document.location.search).get("v")! as VideoId,
};
const init = async () => {
  const key = (await getApiKey()) as ApiKey | undefined;
  if (key) {
    model = { state: "with-api-key", videoId: model.videoId, key };
  }
};
init();

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

const onCache = async () => {
  if (model.state === "with-video-id") {
    // TODO: error handling
    return;
  }
  if (model.state === "with-api-key") {
    update({ type: "next-page" });
    return;
  }
  sendPageResponse(model);
  sendViewPropsResponseIfExists(model);
};

const createUrl = (videoId: VideoId, key: ApiKey, pageToken?: string): URL => {
  const url = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
  url.searchParams.append("part", "snippet");
  url.searchParams.append("order", "relevance");
  url.searchParams.append("maxResults", "100");
  url.searchParams.append("textFormat", "plainText");
  url.searchParams.append("videoId", videoId);
  url.searchParams.append("key", key);

  if (pageToken) {
    url.searchParams.append("pageToken", pageToken);
  }

  return url;
};

type PageResult = {
  comments: string[];
  totalCount: number;
  pageToken?: string;
};

const fetchNextPage = async (
  url: URL,
  currentCount: number
): Promise<PageResult | undefined> => {
  const res = await fetch(url.toString());
  if (!res.ok) {
    // TODO: error handling
    return;
  }

  const resJson = await res.json();
  const pageToken = resJson.nextPageToken;
  const totalCount = currentCount + resJson.pageInfo.totalResults;
  const comments = resJson.items.map(
    (item: any) => item.snippet.topLevelComment.snippet.textOriginal
  );

  return { pageToken, totalCount, comments };
};

const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

const extractTimestampSeconds = (comment: string): number[] => {
  const timestamps = comment.match(timestampPattern);
  if (timestamps === null) {
    return [];
  }

  return timestamps.map((timestamp) => {
    const [first, second, third] = timestamp.split(":");
    const [h, m, s] =
      third === undefined
        ? [0, parseInt(first), parseInt(second)]
        : [parseInt(first), parseInt(second), parseInt(third)];
    return h * 3600 + m * 60 + s;
  });
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
  if (model.state === "with-video-id" || model.state === "last-page-loaded") {
    // TODO: error handling
    return;
  }
  if (model.state === "with-api-key") {
    const pageResult = await fetchNextPage(
      createUrl(model.videoId, model.key),
      0
    );
    if (pageResult === undefined) {
      // TODO: error handling
      return;
    }
    const s2c = createS2C(pageResult.comments);
    model = pageResult.pageToken
      ? {
          state: "with-page-token",
          videoId: model.videoId,
          key: model.key,
          s2c,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
        }
      : {
          state: "last-page-loaded",
          videoId: model.videoId,
          key: model.key,
          s2c,
          totalCount: pageResult.totalCount,
        };
    sendPageResponse(model);
    return;
  }

  const pageResult = await fetchNextPage(
    createUrl(model.videoId, model.key, model.pageToken),
    model.totalCount
  );
  if (pageResult === undefined) {
    // TODO: error handling
    return;
  }
  const s2c = mergeS2C(model.s2c, createS2C(pageResult.comments));
  const viewProps = model.viewProps;
  model = pageResult.pageToken
    ? {
        state: "with-page-token",
        videoId: model.videoId,
        key: model.key,
        s2c,
        totalCount: pageResult.totalCount,
        pageToken: pageResult.pageToken,
        viewProps,
      }
    : {
        state: "last-page-loaded",
        videoId: model.videoId,
        key: model.key,
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
