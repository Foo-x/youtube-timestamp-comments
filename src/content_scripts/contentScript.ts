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
    fetchedSeconds: FetchedComments;
    totalCount: number;
    viewProps?: ViewProps;
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

  const sendPageResponse = (newModel: WithPageToken | LastPageLoaded) => {
    if (newModel.state === 'with-page-token') {
      sendResponse({
        type: 'page',
        data: newModel.fetchedSeconds,
        totalCount: newModel.totalCount,
        isLast: false,
      });
    } else {
      sendResponse({
        type: 'page',
        data: newModel.fetchedSeconds,
        totalCount: newModel.totalCount,
        isLast: true,
      });
    }
  };

  const sendErrorResponse = (errorType: ErrorType) => {
    sendResponse({ type: 'error', data: errorType });
  };

  const onCache = async () => {
    const newModel = init();
    if (model.videoId !== newModel.videoId) {
      model = newModel;
    }
    if (model.state === 'with-video-id' && !(await getApiKey())) {
      sendErrorResponse('invalid-api-key');
      return;
    }
    if (model.state === 'with-video-id') {
      // eslint-disable-next-line no-use-before-define
      update({ type: 'next-page' });
      return;
    }
    sendPageResponse(model);
  };

  const onFirstPage = async () => {
    const pageResult = await fetchNextPage(
      createUrl(model.videoId, (await getApiKey()) as ApiKey),
      0,
    );
    if (pageResult === 'comments-disabled') {
      model = {
        state: 'last-page-loaded',
        videoId: model.videoId,
        fetchedSeconds: { comments: [], secondCommentIndexPairs: [] },
        totalCount: 0,
        lock: model.lock,
      };
    }
    if (typeof pageResult === 'string') {
      sendErrorResponse(pageResult);
      return;
    }
    const fetchedSeconds = createFetchedComments(pageResult.comments);
    model = pageResult.pageToken
      ? {
          state: 'with-page-token',
          videoId: model.videoId,
          fetchedSeconds,
          totalCount: pageResult.totalCount,
          pageToken: pageResult.pageToken,
          lock: model.lock,
        }
      : {
          state: 'last-page-loaded',
          videoId: model.videoId,
          fetchedSeconds,
          totalCount: pageResult.totalCount,
          lock: model.lock,
        };
    sendPageResponse(model);
  };

  const onNextPage = () => {
    void model.lock.acquire('key', async () => {
      if (model.state === 'last-page-loaded') {
        sendPageResponse(model);
        return;
      }
      const key = (await getApiKey()) as ApiKey | undefined;
      if (!key) {
        sendErrorResponse('invalid-api-key');
        return;
      }
      if (model.state === 'with-video-id') {
        void onFirstPage();
        return;
      }

      const pageResult = await fetchNextPage(
        createUrl(model.videoId, key, model.pageToken),
        model.totalCount,
      );
      if (typeof pageResult === 'string') {
        sendErrorResponse(pageResult);
        return;
      }
      const fetchedSeconds = createFetchedComments([
        ...model.fetchedSeconds.comments,
        ...pageResult.comments,
      ]);
      const { viewProps } = model;
      model = pageResult.pageToken
        ? {
            state: 'with-page-token',
            videoId: model.videoId,
            fetchedSeconds,
            totalCount: pageResult.totalCount,
            pageToken: pageResult.pageToken,
            viewProps,
            lock: model.lock,
          }
        : {
            state: 'last-page-loaded',
            videoId: model.videoId,
            fetchedSeconds,
            totalCount: pageResult.totalCount,
            viewProps,
            lock: model.lock,
          };
      sendPageResponse(model);
    });
  };

  const update = (msg: MsgToCS) => {
    if (msg.type === 'cache') {
      void onCache();
      return;
    }
    if (msg.type === 'next-page') {
      onNextPage();
    }
  };

  chrome.runtime.onMessage.addListener((message: MsgToCS) => {
    update(message);
  });
}
