import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = SelectedId;

type Msg = Model;

type Props = PropsWithChildren<{}>;

export const init: Init<Model, Msg, Props> = ({}) => ['ALL', Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const SelectedIdStateContext = createContext<SelectedId>('ALL');
export const SelectedIdDispatchContext = createContext<Dispatch<Msg>>(() => {});

export const view: View<Model, Msg, Props> = ({
  model,
  dispatch,
  children,
}) => {
  return (
    <SelectedIdStateContext.Provider value={model}>
      <SelectedIdDispatchContext.Provider value={dispatch}>
        {children}
      </SelectedIdDispatchContext.Provider>
    </SelectedIdStateContext.Provider>
  );
};

const SelectedIdContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default SelectedIdContextProvider;
