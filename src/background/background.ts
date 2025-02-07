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

const tabIdToWindowId = new Map<number, number>();
const windowIdToTabId = new Map<number, number>();

// remove tab-window mapping on remove window
chrome.windows.onRemoved.addListener((windowId) => {
  const tabId = windowIdToTabId.get(windowId);
  if (tabId != null) {
    windowIdToTabId.delete(windowId);
    tabIdToWindowId.delete(tabId);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id!;
  const windowId = tabIdToWindowId.get(tabId);

  // focus the window if already opened
  if (windowId) {
    await chrome.windows.update(windowId, {
      focused: true,
    });
    return;
  }

  const parentWindow = await chrome.windows.getCurrent();
  const extensionWindow = await chrome.windows.create({
    url: `${chrome.runtime.getURL('/html/page_action/page_action.html')}?${new URLSearchParams(
      {
        tabId: tabId.toString(),
        title: tab.title!,
      },
    ).toString()}`,
    type: 'popup',
    width: 400,
    height: Math.max(parentWindow.height! - 50, 650),
    top: parentWindow.top,
    left:
      parentWindow.left && parentWindow.width
        ? parentWindow.left + parentWindow.width - 350
        : undefined,
  });
  const newWindowId = extensionWindow.id!;
  tabIdToWindowId.set(tabId, newWindowId);
  windowIdToTabId.set(newWindowId, tabId);
});

export {};
