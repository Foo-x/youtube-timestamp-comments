export const sendMessage = (message: MsgToCS) => {
  return new Promise<void>((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, message);
      resolve();
    })
  );
};

export const initContentScript = () => {
  return new Promise<void>((resolve) =>
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: {
            tabId: tabs[0].id!,
          },
          files: ["js/content_scripts/contentScript.js"],
        },
        () => resolve()
      );
    })
  );
};

export const updateTime = (sec: number) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id!,
      },
      args: [sec],
      func: (sec: number) => {
        document.querySelector("video")!.currentTime = sec;
      },
    });
  });
};
