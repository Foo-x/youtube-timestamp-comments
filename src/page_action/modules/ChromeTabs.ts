export const contentTabId = Number(
  new URLSearchParams(window.location.search).get('tabId'),
);

export const sendMessage = async <T = void>(
  message: Omit<MsgToCS, 'tabId'>,
): Promise<T> => {
  return chrome.tabs.sendMessage<MsgToCS, T>(contentTabId, {
    ...message,
    tabId: contentTabId,
  });
};

export const initContentScript = () => {
  return new Promise<void>((resolve) => {
    chrome.scripting.executeScript(
      {
        target: {
          tabId: contentTabId,
        },
        files: ['js/content_scripts/contentScript.js'],
      },
      () => resolve(),
    );
  });
};

export const updateTime = (sec: number) => {
  void chrome.scripting.executeScript({
    target: {
      tabId: contentTabId,
    },
    args: [sec],
    func: (sec_: number) => {
      const video = document.querySelector<HTMLVideoElement>('video[src]');
      if (video != null) {
        video.currentTime = sec_;
      }
    },
  });
};
