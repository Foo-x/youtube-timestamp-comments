import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = boolean;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [false, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const IsApiKeyInvalidStateContext = createContext(false);
export const IsApiKeyInvalidDispatchContext = createContext<Dispatch<Msg>>(
  () => {
    // noop
  }
);

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  children,
}) => {
  return (
    <IsApiKeyInvalidStateContext.Provider value={model}>
      <IsApiKeyInvalidDispatchContext.Provider value={dispatch}>
        {children}
      </IsApiKeyInvalidDispatchContext.Provider>
    </IsApiKeyInvalidStateContext.Provider>
  );
};

const IsApiKeyInvalidContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default IsApiKeyInvalidContextProvider;
