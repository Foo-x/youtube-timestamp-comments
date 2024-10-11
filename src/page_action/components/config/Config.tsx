import {
  Cmd,
  Init,
  Sub,
  Tea,
  Update,
  UseHooks,
  View,
  exhaustiveCheck,
} from '@foo-x/react-tea';
import { useContext } from 'react';
import {
  getApiKey,
  getTheme,
  setApiKey,
  setTheme,
} from 'src/modules/ChromeStorage';
import {
  IsApiKeyInvalidDispatchContext,
  IsApiKeyInvalidStateContext,
} from 'src/page_action/contexts/IsApiKeyInvalidContext';
import { updateTheme } from 'src/page_action/entities/Theme';

type Model = { key: string; theme: Theme };

type Msg =
  | { type: 'update-all'; key: string; theme: Theme }
  | { type: 'update-key'; key: string }
  | { type: 'update-theme'; theme: Theme };

type Props = unknown;

type HooksResult = {
  isApiKeyInvalid: boolean;
  setIsApiKeyInvalid: (v: boolean) => void;
};

export const init: Init<Model, Msg, Props> = () => [
  { key: '', theme: 'device' },
  Cmd.promise(async (dispatch) => {
    dispatch({
      type: 'update-all',
      key: (await getApiKey()) ?? '',
      theme: (await getTheme()) ?? 'device',
    });
  }),
];

export const update: Update<Model, Msg, Props> = ({ model, msg }) => {
  switch (msg.type) {
    case 'update-all':
      setApiKey(msg.key);
      setTheme(msg.theme);
      return [{ ...model, key: msg.key, theme: msg.theme }, Cmd.none()];

    case 'update-key':
      setApiKey(msg.key);
      return [{ ...model, key: msg.key }, Cmd.none()];

    case 'update-theme':
      setTheme(msg.theme);
      updateTheme(msg.theme);
      return [{ ...model, theme: msg.theme }, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};
export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const useHooks: UseHooks<Model, Msg, Props, HooksResult> = () => {
  return {
    isApiKeyInvalid: useContext(IsApiKeyInvalidStateContext),
    setIsApiKeyInvalid: useContext(IsApiKeyInvalidDispatchContext),
  };
};

export const view: View<Model, Msg, Props, HooksResult> = ({
  model: { key, theme },
  dispatch,
  hooksResult: { isApiKeyInvalid, setIsApiKeyInvalid },
}) => {
  return (
    <main className='config main-container' role='main'>
      <section className='section'>
        <div className='error-message'>
          {isApiKeyInvalid ? 'Set a valid API key.' : ''}
        </div>
        <div className='field'>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className='label' htmlFor='api-key-input'>
            API Key
          </label>
          <div className='control'>
            <input
              id='api-key-input'
              name='api-key-input'
              className='api-key-input input'
              type='password'
              placeholder='AIza...'
              value={key}
              onFocus={(event) => event.currentTarget.select()}
              onInput={(event) => {
                setIsApiKeyInvalid(false);
                dispatch({
                  type: 'update-key',
                  key: event.currentTarget.value,
                });
              }}
            />
          </div>
        </div>
        <ul className='setup'>
          <li>
            <a
              href='https://github.com/Foo-x/youtube-timestamp-comments/blob/master/README.md'
              target='_blank'
              rel='noreferrer'
            >
              Set up
            </a>
          </li>
          <li>
            <a
              href='https://github.com/Foo-x/youtube-timestamp-comments/blob/master/README.ja.md'
              target='_blank'
              rel='noreferrer'
            >
              設定
            </a>
          </li>
        </ul>
      </section>
      <section className='section'>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label className='label' htmlFor='theme-select'>
          Theme
        </label>
        <div className='select'>
          <select
            id='theme-select'
            onChange={(event) =>
              dispatch({
                type: 'update-theme',
                theme: event.currentTarget.value as Theme,
              })
            }
            value={theme}
          >
            <option value='device'>Device theme</option>
            <option value='light'>Light theme</option>
            <option value='dark'>Dark theme</option>
          </select>
        </div>
      </section>
    </main>
  );
};

const Config = Tea({ init, update, subscriptions, useHooks, view });

export default Config;
