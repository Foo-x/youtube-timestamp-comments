import { Cmd, Init, Sub, Tea, Update, UseHooks, View } from "@foo-x/react-tea";
import { useContext } from "react";
import { getApiKey, setApiKey } from "src/modules/ChromeStorage";
import {
  IsApiKeyInvalidDispatchContext,
  IsApiKeyInvalidStateContext,
} from "src/page_action/contexts/IsApiKeyInvalidContext";

type Model = string;

type Msg = Model;

type Props = {};

type HooksResult = {
  isApiKeyInvalid: boolean;
  setIsApiKeyInvalid: (v: boolean) => void;
};

export const init: Init<Model, Msg, Props> = ({}) => [
  "",
  Cmd.promise(async (dispatch) => {
    dispatch((await getApiKey()) ?? "");
  }),
];

export const update: Update<Model, Msg, Props> = ({ msg }) => {
  setApiKey(msg);
  return [msg, Cmd.none()];
};
export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const useHooks: UseHooks<Model, Msg, Props, HooksResult> = ({}) => {
  return {
    isApiKeyInvalid: useContext(IsApiKeyInvalidStateContext),
    setIsApiKeyInvalid: useContext(IsApiKeyInvalidDispatchContext),
  };
};

export const view: View<Model, Msg, Props, HooksResult> = ({
  model: key,
  dispatch,
  hooksResult: { isApiKeyInvalid, setIsApiKeyInvalid },
}) => {
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

const Config = Tea({ init, update, subscriptions, useHooks, view });

export default Config;
