import { Cmd, Init, Sub, Tea, Update, View } from '@foo-x/react-tea';
import { createContext, Dispatch, PropsWithChildren } from 'react';

type Model = FetchedComments;

type Msg = Model;

type Props = PropsWithChildren<unknown>;

export const init: Init<Model, Msg, Props> = () => [
  {
    comments: [],
    secondCommentIndexPairs: [],
  },
  Cmd.none(),
];

export const update: Update<Model, Msg, Props> = ({ msg }) => [msg, Cmd.none()];

export const FetchedCommentsStateContext = createContext<FetchedComments>({
  comments: [],
  secondCommentIndexPairs: [],
});
export const FetchedCommentsDispatchContext = createContext<Dispatch<Msg>>(
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
    <FetchedCommentsStateContext.Provider value={model}>
      <FetchedCommentsDispatchContext.Provider value={dispatch}>
        {children}
      </FetchedCommentsDispatchContext.Provider>
    </FetchedCommentsStateContext.Provider>
  );
};

const FetchedCommentsContextProvider = Tea({
  init,
  update,
  view,
  subscriptions: Sub.none(),
});

export default FetchedCommentsContextProvider;
