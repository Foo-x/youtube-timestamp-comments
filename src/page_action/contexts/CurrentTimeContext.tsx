import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = {
  currentTime: number;
  duration: number;
};

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [
  { currentTime: 0, duration: 0 },
  Cmd.none(),
];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const CurrentTimeStateContext = createContext({
  currentTime: 0,
  duration: 0,
});
export const CurrentTimeDispatchContext = createContext<Dispatch<Msg>>(() => {
  // noop
});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  props: { children },
}) => {
  return (
    <CurrentTimeStateContext.Provider value={model}>
      <CurrentTimeDispatchContext.Provider value={dispatch}>
        {children}
      </CurrentTimeDispatchContext.Provider>
    </CurrentTimeStateContext.Provider>
  );
};

const CurrentTimeContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default CurrentTimeContextProvider;
