import { useContext, useEffect, useReducer } from "react";
import { getApiKey, setApiKey } from "../../modules/ChromeStorage";
import { IsApiKeyInvalidContext } from "../contexts/AppContext";

const apiKeyReducer = (_: string, newKey: string): string => {
  setApiKey(newKey);
  return newKey;
};

const Config = () => {
  const [key, dispatch] = useReducer(apiKeyReducer, "");
  const [isApiKeyInvalid, setIsApiKeyInvalid] = useContext(
    IsApiKeyInvalidContext
  );

  useEffect(() => {
    (async () => {
      dispatch((await getApiKey()) ?? "");
    })();
  }, []);

  return (
    <main className="config main-container" role="main">
      <section className="section">
        <div className="error-message">
          {isApiKeyInvalid ? "Set a valid API key." : ""}
        </div>
        <div className="field">
          <label className="label" htmlFor="api-key-input">
            API Key
          </label>
          <div className="control">
            <input
              id="api-key-input"
              name="api-key-input"
              className="api-key-input input"
              type="password"
              placeholder="AIza..."
              value={key}
              onFocus={(event) => event.currentTarget.select()}
              onInput={(event) => {
                setIsApiKeyInvalid(false);
                dispatch(event.currentTarget.value);
              }}
            />
          </div>
        </div>
        <ul className="setup">
          <li>
            <a
              href="https://github.com/Foo-x/youtube-timestamp-comments/blob/master/README.md"
              target="_blank"
              rel="noreferrer"
            >
              Set up
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Foo-x/youtube-timestamp-comments/blob/master/README.ja.md"
              target="_blank"
              rel="noreferrer"
            >
              設定
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
};

export default Config;
