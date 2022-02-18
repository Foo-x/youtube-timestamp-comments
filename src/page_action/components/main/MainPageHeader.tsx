import { Cmd, Init, Sub, Tea, Update, UseHooks, View } from "@foo-x/react-tea";
import { sendMessage } from "pa/modules/ChromeTabs";
import {
  ReactElement,
  RefObject,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { IsLastStateContext } from "src/page_action/contexts/IsLastContext";
import {
  IsProgressDispatchContext,
  IsProgressStateContext,
} from "src/page_action/contexts/IsProgressContext";
import { ScrollDispatchContext } from "src/page_action/contexts/ScrollContext";
import { SideMenuRefStateContext } from "src/page_action/contexts/SideMenuRefContext";
import {
  SideMenuScrollDispatchContext,
  SideMenuScrollStateContext,
} from "src/page_action/contexts/SideMenuScrollContext";
import { TotalCountStateContext } from "src/page_action/contexts/TotalCountContext";

type Model = null;

type Msg = Model;

type Props = {};

type HooksResult = {
  totalCount: number;
  isLast: boolean;
  setScroll: (v: number) => void;
  sideMenuScroll: number;
  setSideMenuScroll: (v: number) => void;
  sideMenuRef: RefObject<HTMLUListElement>;
  progress: ReactElement;
  fetchNextPage: () => void;
};

export const init: Init<Model, Msg, Props> = ({}) => [null, Cmd.none()];

export const update: Update<Model, Msg, Props> = ({}) => {
  return [null, Cmd.none()];
};
export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const useHooks: UseHooks<Model, Msg, Props, HooksResult> = ({}) => {
  const totalCount = useContext(TotalCountStateContext);
  const isLast = useContext(IsLastStateContext);
  const isProgress = useContext(IsProgressStateContext);
  const setIsProgress = useContext(IsProgressDispatchContext);
  const setScroll = useContext(ScrollDispatchContext);
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const setSideMenuScroll = useContext(SideMenuScrollDispatchContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);

  const progress = useMemo(
    () =>
      isProgress ? (
        <div>
          <progress className="progress is-info" />
        </div>
      ) : (
        <div className="progress-stopped"></div>
      ),
    [isProgress]
  );

  const fetchNextPage = useCallback(() => {
    setIsProgress(true);
    sendMessage({ type: "next-page" });
  }, [setIsProgress]);

  return {
    totalCount,
    isLast,
    setScroll,
    sideMenuScroll,
    setSideMenuScroll,
    sideMenuRef,
    progress,
    fetchNextPage,
  };
};

export const view: View<Model, Msg, Props, HooksResult> = ({
  hooksResult: {
    totalCount,
    isLast,
    setScroll,
    sideMenuScroll,
    setSideMenuScroll,
    sideMenuRef,
    progress,
    fetchNextPage,
  },
}) => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-menu is-flex">
          <div className="navbar-start flex-grow-1">
            <div className="navbar-item">
              {totalCount}
              {isLast ? "" : "+"}
            </div>
          </div>
          <div className="navbar-end">
            <a
              className={isLast ? "navbar-item disabled" : "navbar-item"}
              onClick={fetchNextPage}
            >
              <span className="icon">
                <i className="fas fa-angle-right fa-lg" />
              </span>
            </a>
            <Link
              to="/config"
              className="navbar-item"
              onClick={() => {
                setScroll(window.scrollY);
                setSideMenuScroll(
                  sideMenuRef.current?.scrollTop ?? sideMenuScroll
                );
              }}
            >
              <span className="icon">
                <i className="fas fa-cog fa-sm" />
              </span>
            </Link>
          </div>
        </div>
      </nav>
      {progress}
    </header>
  );
};

const MainPageHeader = Tea({ init, update, subscriptions, useHooks, view });

export default MainPageHeader;
