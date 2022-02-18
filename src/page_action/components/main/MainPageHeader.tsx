import { sendMessage } from "pa/modules/ChromeTabs";
import { memo, useContext } from "react";
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

const MainPageHeader = () => {
  const totalCount = useContext(TotalCountStateContext);
  const isLast = useContext(IsLastStateContext);
  const isProgress = useContext(IsProgressStateContext);
  const setIsProgress = useContext(IsProgressDispatchContext);
  const setScroll = useContext(ScrollDispatchContext);
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const setSideMenuScroll = useContext(SideMenuScrollDispatchContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);

  const progress = isProgress ? (
    <div>
      <progress className="progress is-info" />
    </div>
  ) : (
    <div className="progress-stopped"></div>
  );

  const fetchNextPage = () => {
    setIsProgress(true);
    sendMessage({ type: "next-page" });
  };

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

export default memo(MainPageHeader);
