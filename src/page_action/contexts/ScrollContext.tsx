import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = number;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [0, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const ScrollStateContext = createContext(0);
export const ScrollDispatchContext = createContext<Dispatch<Msg>>(() => {
  // noop
});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  props: { children },
}) => {
  return (
    <ScrollStateContext.Provider value={model}>
      <ScrollDispatchContext.Provider value={dispatch}>
        {children}
      </ScrollDispatchContext.Provider>
    </ScrollStateContext.Provider>
  );
};

const ScrollContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default ScrollContextProvider;
