const TARGET_HOST = "www.youtube.com";
const TARGET_PATH = "/watch";

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: TARGET_HOST, pathPrefix: TARGET_PATH },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

chrome.tabs.onUpdated.addListener(
  (tabId: number, change: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    const url = new URL(tab.url!);
    if (url.hostname !== TARGET_HOST || url.pathname !== TARGET_PATH) {
      return;
    }

    if (change.url) {
      chrome.tabs.sendMessage(tabId, {
        type: "initialize",
      });
    }

    if (change.status === "complete") {
      chrome.tabs.sendMessage(tabId, {
        type: "load-continuation",
        tabId,
        data: url.searchParams.get("v"),
      });
    }
  }
);

export {};
