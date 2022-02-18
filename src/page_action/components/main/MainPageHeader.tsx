import {
  IsLastContext,
  IsProgressContext,
  ScrollContext,
  TotalCountContext,
} from "pa/contexts/AppContext";
import { sendMessage } from "pa/modules/ChromeTabs";
import { useContext } from "react";
import { Link } from "react-router-dom";

const MainPageHeader = () => {
  const totalCount = useContext(TotalCountContext);
  const isLast = useContext(IsLastContext);
  const [isProgress, setIsProgress] = useContext(IsProgressContext);
  const setScroll = useContext(ScrollContext)[1];

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
              onClick={() => setScroll(window.scrollY)}
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

export default MainPageHeader;
