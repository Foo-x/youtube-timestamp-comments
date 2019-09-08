const onCurrentTab = f => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    f(tabs[0]);
  });
};

// ports

const onMessage = app => {
  chrome.runtime.onMessage.addListener(message => {
    app.ports.sendMessageResponse.send(message);
  });
};

const sendMessage = app => {
  app.ports.sendMessage.subscribe(data => {
    onCurrentTab(tab => {
      chrome.tabs.sendMessage(tab.id, data);
    });
  });
};

const updateTime = app => {
  app.ports.updateTime.subscribe(seconds => {
    chrome.tabs.executeScript({
      code: `document.querySelector('video').currentTime = ${seconds}`
    });
  });
};

export const register = app => {
  [onMessage, sendMessage, updateTime].forEach(f => f(app));
};
