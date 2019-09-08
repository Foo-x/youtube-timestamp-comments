import { fetchInitialConfig } from "./configApi";

const onMessage = app => {
  chrome.runtime.onMessage.addListener(message => {
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
    chrome.runtime.sendMessage(response);
  });
};

const setUpYouTubeConfig = (app, videoId) => config => {
  app.ports.setUpYouTubeConfig.send({ ...config, videoId });
};

export const register = app => {
  [onMessage, sendResponse].forEach(f => f(app));
};
