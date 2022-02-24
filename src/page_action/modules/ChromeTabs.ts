export const sendMessage = (message: MsgToCS) => {
  return new Promise<void>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const { id } = tabs[0];
      if (id != null) {
        chrome.tabs.sendMessage(id, message);
      }
      resolve();
    });
  });
};

export const initContentScript = () => {
  return new Promise<void>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const { id } = tabs[0];
      if (id != null) {
        chrome.scripting.executeScript(
          {
            target: {
              tabId: id,
            },
            files: ['js/content_scripts/contentScript.js'],
          },
          () => resolve()
        );
      }
    });
  });
};

export const updateTime = (sec: number) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id } = tabs[0];
    if (id != null) {
      void chrome.scripting.executeScript({
        target: {
          tabId: id,
        },
        args: [sec],
        func: (sec_: number) => {
          const video = document.querySelector<HTMLVideoElement>('video[src]');
          if (video != null) {
            video.currentTime = sec_;
          }
        },
      });
    }
  });
};
