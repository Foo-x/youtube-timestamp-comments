import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = number;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [0, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const TotalCountStateContext = createContext(0);
export const TotalCountDispatchContext = createContext<Dispatch<Msg>>(() => {
  // noop
});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  children,
}) => {
  return (
    <TotalCountStateContext.Provider value={model}>
      <TotalCountDispatchContext.Provider value={dispatch}>
        {children}
      </TotalCountDispatchContext.Provider>
    </TotalCountStateContext.Provider>
  );
};

const TotalCountContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default TotalCountContextProvider;
