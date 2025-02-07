import AsyncLock from 'async-lock';
import { getApiKey } from 'src/modules/ChromeStorage';
import { createUrl, fetchNextPage } from './apis/YouTubeDataApi';
import { createFetchedComments } from './entities/FetchedComments';

if (!chrome.runtime.onMessage.hasListeners()) {
  // MODEL

  type Common = {
    state: string;
    videoId: VideoId;
    lock: AsyncLock;
  };
  type WithVideoId = Common & {
    state: 'with-video-id';
  };
  type LastPageLoaded = Common & {
    state: 'last-page-loaded';
    fetchedComments: FetchedComments;
    totalCount: number;
  };
  type WithPageToken = Omit<LastPageLoaded, 'state'> & {
    state: 'with-page-token';
    pageToken: string;
  };
  type Model = WithVideoId | LastPageLoaded | WithPageToken;

  const init = (): WithVideoId => ({
    state: 'with-video-id',
    videoId: (new URLSearchParams(document.location.search).get('v') ??
      '') as VideoId,
    lock: new AsyncLock(),
  });
  let model: Model = init();

  // UPDATE

  const sendResponse = (responseMsg: MsgToPA) => {
    void chrome.runtime.sendMessage(responseMsg);
  };

  const sendPageResponse = (
    newModel: WithPageToken | LastPageLoaded,
    tabId: number,
  ) => {
    if (newModel.state === 'with-page-token') {
      sendResponse({
        type: 'page',
        data: newModel.fetchedComments,
        totalCount: newModel.totalCount,
        isLast: false,
        tabId,
      });
    } else {
      sendResponse({
        type: 'page',
        data: newModel.fetchedComments,
        totalCount: newModel.totalCount,
        isLast: true,
        tabId,
      });
    }
  };

  const sendErrorResponse = (errorType: ErrorType, tabId: number) => {
    sendResponse({ type: 'error', data: errorType, tabId });
  };

  const onCache = async (tabId: number) => {
    const newModel = init();
    if (model.videoId !== newModel.videoId) {
      model = newModel;
    }
    if (model.state === 'with-video-id' && !(await getApiKey())) {
      sendErrorResponse('invalid-api-key', tabId);
      return;
    }
    if (model.state === 'with-video-id') {
      // eslint-disable-next-line no-use-before-define
      update({ type: 'next-page', tabId });
      return;
    }
    sendPageResponse(model, tabId);
  };

  const onFirstPage = async (tabId: number) => {
    const pageResult = await fetchNextPage(
      createUrl(model.videoId, (await getApiKey()) as ApiKey),
      0,
    );
    if (pageResult === 'comments-disabled') {
      model = {
        state: 'last-page-loaded',
        videoId: model.videoId,
        fetchedComments: { comments: [], secondCommentIndexPairs: [] },
        totalCount: 0,
        lock: model.lock,
      };
    }
    if (typeof pageResult === 'string') {
      sendErrorResponse(pageResult, tabId);
      return;
    }
    const fetchedComments = createFetchedComments(pageResult.comments);
    model = pageResult.pageToken
      ? {
          state: 'with-page-token',
          videoId: model.videoId,
          fetchedComments,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
          lock: model.lock,
        }
      : {
          state: 'last-page-loaded',
          videoId: model.videoId,
          fetchedComments,
          totalCount: pageResult.totalCount,
          lock: model.lock,
        };
    sendPageResponse(model, tabId);
  };

  const onNextPage = (tabId: number) => {
    void model.lock.acquire('key', async () => {
      if (model.state === 'last-page-loaded') {
        sendPageResponse(model, tabId);
        return;
      }
      const key = (await getApiKey()) as ApiKey | undefined;
      if (!key) {
        sendErrorResponse('invalid-api-key', tabId);
        return;
      }
      if (model.state === 'with-video-id') {
        void onFirstPage(tabId);
        return;
      }

      const pageResult = await fetchNextPage(
        createUrl(model.videoId, key, model.pageToken),
        model.totalCount,
      );
      if (typeof pageResult === 'string') {
        sendErrorResponse(pageResult, tabId);
        return;
      }
      const fetchedComments = createFetchedComments([
        ...model.fetchedComments.comments,
        ...pageResult.comments,
      ]);
      model = pageResult.pageToken
        ? {
            state: 'with-page-token',
            videoId: model.videoId,
            fetchedComments,
            totalCount: pageResult.totalCount,
            pageToken: pageResult.pageToken,
            lock: model.lock,
          }
        : {
            state: 'last-page-loaded',
            videoId: model.videoId,
            fetchedComments,
            totalCount: pageResult.totalCount,
            lock: model.lock,
          };
      sendPageResponse(model, tabId);
    });
  };

  const onHealthCheck = (
    sendResult: (result: MsgToPA) => void,
    tabId: number,
  ) => {
    sendResult({
      type: 'health-check',
      videoId: (new URLSearchParams(document.location.search).get('v') ??
        '') as VideoId,
      tabId,
    });
  };

  const update = (
    msg: MsgToCS,
    sendResult: (result: MsgToPA) => void = () => {
      // Nop
    },
  ) => {
    // use `sendMessage` to handle with `onMessage` on the page action
    if (msg.type === 'cache') {
      void onCache(msg.tabId);
      return;
    }
    if (msg.type === 'next-page') {
      onNextPage(msg.tabId);
      return;
    }
    // use `sendResult` to handle with `then/catch` on the page action
    if (msg.type === 'health-check') {
      void onHealthCheck(sendResult, msg.tabId);
    }
  };

  chrome.runtime.onMessage.addListener((message: MsgToCS, _, sendResult) => {
    update(message, sendResult);
    return true;
  });
}
