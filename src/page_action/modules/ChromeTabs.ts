const contentTabId = Number(new URLSearchParams(location.search).get('tabId'));

export const sendMessage = (message: MsgToCS) => {
  return new Promise<void>((resolve) => {
    chrome.tabs.sendMessage(contentTabId, message);
    resolve();
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
