import { useEffect, useReducer } from "react";
import { getApiKey, setApiKey } from "../modules/ChromeStorage";

const apiKeyReducer = (_: string, newKey: string): string => {
  setApiKey(newKey);
  return newKey;
};

const Config = () => {
  const [key, dispatch] = useReducer(apiKeyReducer, "");

  useEffect(() => {
    (async () => {
      dispatch((await getApiKey()) ?? "");
    })();
  }, []);

  return (
    <main className="config main-container" role="main">
      <section className="section">
        <div className="field">
          <label className="label" htmlFor="api-key-input">
            API Key
          </label>
          <div className="control">
            <input
              id="api-key-input"
              name="api-key-input"
              className="api-key-input input"
              type="text"
              placeholder="AIza..."
              value={key}
              onInput={(event) => dispatch(event.currentTarget.value)}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Config;
