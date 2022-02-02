const TARGET_HOST = "www.youtube.com";
const TARGET_PATH = "/watch";

chrome.runtime.onInstalled.addListener(function () {
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: TARGET_HOST, pathPrefix: TARGET_PATH },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

export {};
