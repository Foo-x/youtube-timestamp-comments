import { Cmd, Init, Sub, Tea, Update, UseHooks, View } from "@foo-x/react-tea";
import { secToTimeStr } from "pa/entities/Time";
import { updateTime } from "pa/modules/ChromeTabs";
import { RefObject, useContext, useEffect } from "react";
import { FetchedCommentsStateContext } from "src/page_action/contexts/FetchedCommentsContext";
import {
  SelectedIdDispatchContext,
  SelectedIdStateContext,
} from "src/page_action/contexts/SelectedIdContext";
import { SelectedSecondsDispatchContext } from "src/page_action/contexts/SelectedSecondsContext";
import { SideMenuRefStateContext } from "src/page_action/contexts/SideMenuRefContext";
import { SideMenuScrollStateContext } from "src/page_action/contexts/SideMenuScrollContext";

type Model = null;

type Msg = Model;

type Props = {};

type HooksResult = {
  secondCommentIndexPairs: [number, number][];
  sideMenuRef: RefObject<HTMLUListElement>;
  selectedId: SelectedId;
  setSelectedId: (v: SelectedId) => void;
  setSelectedSeconds: (v: SelectedSeconds) => void;
};

export const init: Init<Model, Msg, Props> = ({}) => [null, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({}) => {
  return [null, Cmd.none()];
};
export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const useHooks: UseHooks<Model, Msg, Props, HooksResult> = ({}) => {
  const secondCommentIndexPairs = useContext(
    FetchedCommentsStateContext
  ).secondCommentIndexPairs;
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const setSelectedId = useContext(SelectedIdDispatchContext);
  const setSelectedSeconds = useContext(SelectedSecondsDispatchContext);

  useEffect(() => {
    sideMenuRef.current?.scroll(0, sideMenuScroll);
  }, [sideMenuScroll, sideMenuRef.current]);

  return {
    secondCommentIndexPairs,
    sideMenuRef,
    selectedId,
    setSelectedId,
    setSelectedSeconds,
  };
};

export const view: View<Model, Msg, Props, HooksResult> = ({
  hooksResult: {
    secondCommentIndexPairs,
    sideMenuRef,
    selectedId,
    setSelectedId,
    setSelectedSeconds,
  },
}) => {
  return (
    <aside className="menu column is-4">
      <ul
        id="side-menu-list"
        className="menu-list side-menu-list"
        ref={sideMenuRef}
      >
        <li>
          <a
            className={selectedId === "ALL" ? "is-active" : ""}
            onClick={() => {
              setSelectedId("ALL");
              setSelectedSeconds("ALL");
            }}
          >
            ALL
          </a>
        </li>
        {secondCommentIndexPairs.map(([sec], id) => {
          const timeStr = secToTimeStr(sec);
          const button =
            selectedId === id ? (
              <a className="is-active" onClick={() => updateTime(sec)}>
                {timeStr}
              </a>
            ) : (
              <a
                onClick={() => {
                  setSelectedId(id);
                  setSelectedSeconds(sec);
                }}
              >
                {timeStr}
              </a>
            );
          return <li key={id}>{button}</li>;
        })}
      </ul>
    </aside>
  );
};

const MainSideMenu = Tea({ init, update, subscriptions, useHooks, view });

export default MainSideMenu;
