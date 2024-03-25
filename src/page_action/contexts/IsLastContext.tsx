import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = boolean;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [false, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const IsLastStateContext = createContext(false);
export const IsLastDispatchContext = createContext<Dispatch<Msg>>(() => {
  // noop
});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  props: { children },
}) => {
  return (
    <IsLastStateContext.Provider value={model}>
      <IsLastDispatchContext.Provider value={dispatch}>
        {children}
      </IsLastDispatchContext.Provider>
    </IsLastStateContext.Provider>
  );
};

const IsLastContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default IsLastContextProvider;
