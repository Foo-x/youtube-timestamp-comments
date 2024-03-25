import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = SelectedSeconds;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => ['ALL', Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const SelectedSecondsStateContext =
  createContext<SelectedSeconds>('ALL');
export const SelectedSecondsDispatchContext = createContext<Dispatch<Msg>>(
  () => {
    // noop
  },
);

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  props: { children },
}) => {
  return (
    <SelectedSecondsStateContext.Provider value={model}>
      <SelectedSecondsDispatchContext.Provider value={dispatch}>
        {children}
      </SelectedSecondsDispatchContext.Provider>
    </SelectedSecondsStateContext.Provider>
  );
};

const SelectedSecondsContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default SelectedSecondsContextProvider;
