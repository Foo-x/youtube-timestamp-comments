const onCurrentTab = (f) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    f(tabs[0]);
  });
};

// ports

let tabId;

const onMessage = (app) => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.tabId !== tabId) {
      return;
    }

    app.ports.sendMessageResponse.send(message);
  });
};

const sendMessage = (app) => {
  app.ports.sendMessage.subscribe((data) => {
    onCurrentTab((tab) => {
      chrome.tabs.sendMessage(tab.id, { ...data, tabId: tab.id });
    });
  });
};

const updateTime = (app) => {
  app.ports.updateTime.subscribe((seconds) => {
    chrome.tabs.executeScript({
      code: `document.querySelector('video').currentTime = ${seconds}`,
    });
  });
};

const onScroll = (app) => {
  window.onscroll = () => {
    app.ports.onScroll.send(window.scrollY);
  };
};

const scroll = (app) => {
  app.ports.scroll.subscribe((scroll) => {
    requestAnimationFrame(() => {
      window.scrollTo(0, scroll);
    });
  });
};

export const register = (app) => {
  [onMessage, sendMessage, updateTime, onScroll, scroll].forEach((f) => f(app));
  onCurrentTab((tab) => {
    tabId = tab.id;
  });
};
