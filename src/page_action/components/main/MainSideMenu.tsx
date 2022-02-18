import {
  FetchedCommentsContext,
  SelectedIdContext,
  SelectedSecondsContext,
  SideMenuScrollContext,
} from "pa/contexts/AppContext";
import { secToTimeStr } from "pa/entities/Time";
import { updateTime } from "pa/modules/ChromeTabs";
import { useContext, useEffect, useRef } from "react";

const MainSideMenu = () => {
  const fetchedComments = useContext(FetchedCommentsContext);
  const [sideMenuScroll, setSideMenuScroll] = useContext(SideMenuScrollContext);
  const [selectedId, setSelectedId] = useContext(SelectedIdContext);
  const setSelectedSeconds = useContext(SelectedSecondsContext)[1];

  const sideMenuListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    sideMenuListRef.current?.scroll(0, sideMenuScroll);
  }, [sideMenuScroll]);

  const onscroll: React.UIEventHandler = (event) => {
    setSideMenuScroll(event.currentTarget.scrollTop);
  };

  return (
    <aside className="menu column is-4">
      <ul
        id="side-menu-list"
        className="menu-list side-menu-list"
        onScroll={onscroll}
        ref={sideMenuListRef}
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
