import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = number;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [0, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const SideMenuScrollStateContext = createContext(0);
export const SideMenuScrollDispatchContext = createContext<Dispatch<Msg>>(
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
    <SideMenuScrollStateContext.Provider value={model}>
      <SideMenuScrollDispatchContext.Provider value={dispatch}>
        {children}
      </SideMenuScrollDispatchContext.Provider>
    </SideMenuScrollStateContext.Provider>
  );
};

const SideMenuScrollContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default SideMenuScrollContextProvider;
