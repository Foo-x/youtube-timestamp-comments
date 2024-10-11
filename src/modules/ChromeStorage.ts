type Storage = {
  key?: string;
  theme?: Theme;
};

export const setApiKey = (key: string): void => {
  void chrome.storage.sync.set({ key });
};

export const getApiKey = async (): Promise<string | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('key', (storage: Storage) => {
      resolve(storage.key);
    });
  });
};

export const setTheme = (theme: Theme): void => {
  void chrome.storage.sync.set({ theme });
};

export const getTheme = async (): Promise<Theme | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get('theme', (storage: Storage) => {
      resolve(storage.theme);
    });
  });
};
