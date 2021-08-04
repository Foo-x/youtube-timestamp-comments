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
      chrome.tabs.executeScript(
        tabs[0].id!,
        {
          file: "js/content_scripts/contentScript.js",
        },
        () => resolve()
      );
    })
  );
};
