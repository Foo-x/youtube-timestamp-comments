import { useContext } from "react";
import { Link } from "react-router-dom";
import {
  IsLastContext,
  IsProgressContext,
  TotalCountContext,
} from "../contexts/AppContext";

const MainPageHeader = () => {
  const totalCount = useContext(TotalCountContext);
  const isLast = useContext(IsLastContext);
  const isProgress = useContext(IsProgressContext);

  const progress = isProgress ? (
    <div>
      <progress className="progress is-info" />
    </div>
  ) : (
    <div className="progress-stopped"></div>
  );

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
            <a className={isLast ? "navbar-item disabled" : "navbar-item"}>
              <span className="icon">
                <i className="fas fa-angle-right fa-lg" />
              </span>
            </a>
            <Link to="/config" className="navbar-item">
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
