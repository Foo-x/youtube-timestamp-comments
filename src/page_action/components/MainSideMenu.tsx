import { useContext, useEffect, useRef } from "react";
import {
  Second2CommentsContext,
  SelectedSecondsContext,
  SideMenuScrollContext,
} from "../contexts/AppContext";
import { secToTimeStr } from "../entities/Second2Comments";
import { updateTime } from "../modules/ChromeTabs";

const MainSideMenu = () => {
  const s2c = useContext(Second2CommentsContext);
  const [sideMenuScroll, setSideMenuScroll] = useContext(SideMenuScrollContext);
  const [selectedSeconds, setSelectedSeconds] = useContext(
    SelectedSecondsContext
  );

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
            className={selectedSeconds === "ALL" ? "is-active" : ""}
            onClick={() => setSelectedSeconds("ALL")}
          >
            ALL
          </a>
        </li>
        {Array.from(s2c.keys(), (key) => {
          const timeStr = secToTimeStr(key);
          const button =
            selectedSeconds === key ? (
              <a className="is-active" onClick={() => updateTime(key)}>
                {timeStr}
              </a>
            ) : (
              <a onClick={() => setSelectedSeconds(key)}>{timeStr}</a>
            );
          return <li key={key}>{button}</li>;
        })}
      </ul>
    </aside>
  );
};

export default MainSideMenu;
