import { fetchInitialConfig } from "./configApi";

let tabId;

const onMessage = app => {
  chrome.runtime.onMessage.addListener(message => {
    if (tabId === undefined && message.tabId !== undefined) {
      tabId = message.tabId;
    }
    if (tabId !== message.tabId) {
      return true;
    }

    if (message.type === "load-continuation") {
      fetchInitialConfig().then(setUpYouTubeConfig(app, message.data));
      return true;
    }

    app.ports.onMessage.send(message);
    return true;
  });
};

const sendResponse = app => {
  app.ports.sendResponse.subscribe(response => {
    chrome.runtime.sendMessage({ ...response, tabId });
  });
};

const setUpYouTubeConfig = (app, videoId) => config => {
  app.ports.setUpYouTubeConfig.send({ ...config, videoId });
};

export const register = app => {
  [onMessage, sendResponse].forEach(f => f(app));
};
