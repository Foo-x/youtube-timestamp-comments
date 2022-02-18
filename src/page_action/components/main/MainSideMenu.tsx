import { secToTimeStr } from "pa/entities/Time";
import { updateTime } from "pa/modules/ChromeTabs";
import { useContext, useEffect } from "react";
import { FetchedCommentsStateContext } from "src/page_action/contexts/FetchedCommentsContext";
import {
  SelectedIdDispatchContext,
  SelectedIdStateContext,
} from "src/page_action/contexts/SelectedIdContext";
import { SelectedSecondsDispatchContext } from "src/page_action/contexts/SelectedSecondsContext";
import { SideMenuRefStateContext } from "src/page_action/contexts/SideMenuRefContext";
import { SideMenuScrollStateContext } from "src/page_action/contexts/SideMenuScrollContext";

const MainSideMenu = () => {
  const fetchedComments = useContext(FetchedCommentsStateContext);
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const setSelectedId = useContext(SelectedIdDispatchContext);
  const setSelectedSeconds = useContext(SelectedSecondsDispatchContext);

  useEffect(() => {
    sideMenuRef.current?.scroll(0, sideMenuScroll);
  }, [sideMenuScroll, sideMenuRef.current]);

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
        {fetchedComments.secondCommentIndexPairs.map(([sec], id) => {
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

export default MainSideMenu;
