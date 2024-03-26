const TARGET_HOST = 'www.youtube.com';
const TARGET_PATH = '/watch';

chrome.runtime.onInstalled.addListener(() => {
  void chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
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

let windowId: number | undefined;
chrome.windows.onRemoved.addListener((wid) => {
  if (wid === windowId) {
    windowId = undefined;
  }
});
chrome.action.onClicked.addListener(async (tab) => {
  if (windowId) {
    await chrome.windows.remove(windowId);
  }
  const parentWindow = await chrome.windows.getCurrent();
  const extensionWindow = await chrome.windows.create({
    url: `${chrome.runtime.getURL('/html/page_action/page_action.html')}?${new URLSearchParams(
      {
        tabId: tab.id!.toString(),
        title: tab.title!,
      },
    ).toString()}`,
    type: 'popup',
    width: 350,
    height: 650,
    left:
      parentWindow.left && parentWindow.width
        ? parentWindow.left + parentWindow.width - 350
        : undefined,
  });
  windowId = extensionWindow.id;
});

export {};
