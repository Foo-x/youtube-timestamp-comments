type Storage = {
  key?: string;
};

export const setApiKey = (key: string): void => {
  chrome.storage.sync.set({ key });
};

export const getApiKey = async (): Promise<string | undefined> => {
  return new Promise((resolve) =>
    chrome.storage.sync.get("key", (storage: Storage) => {
      resolve(storage.key);
    })
  );
};
