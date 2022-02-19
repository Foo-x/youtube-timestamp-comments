import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = boolean;

type Msg = Model;

type Props = PropsWithChildren<{}>;

export const init: Init<Model, Msg, Props> = ({}) => [false, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const IsProgressStateContext = createContext(false);
export const IsProgressDispatchContext = createContext<Dispatch<Msg>>(() => {});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  children,
}) => {
  return (
    <IsProgressStateContext.Provider value={model}>
      <IsProgressDispatchContext.Provider value={dispatch}>
        {children}
      </IsProgressDispatchContext.Provider>
    </IsProgressStateContext.Provider>
  );
};

const IsProgressContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default IsProgressContextProvider;
