import { Cmd, Init, Sub, Tea, Update, View } from "@foo-x/react-tea";
import { createContext, createRef, PropsWithChildren, RefObject } from "react";

type Model = RefObject<HTMLUListElement>;

type Msg = Model;

type Props = PropsWithChildren<{}>;

export const init: Init<Model, Msg, Props> = ({}) => [createRef(), Cmd.none()];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const SideMenuRefStateContext = createContext<
  RefObject<HTMLUListElement>
>(createRef());

export const view: View<Model, Msg, Props> = ({ model, children }) => {
  return (
    <SideMenuRefStateContext.Provider value={model}>
      {children}
    </SideMenuRefStateContext.Provider>
  );
};

const SideMenuRefContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default SideMenuRefContextProvider;
