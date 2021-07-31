import { useContext } from "react";
import { Link } from "react-router-dom";
import { IsLastContext, TotalCountContext } from "../contexts/AppContext";

const MainPageHeader = () => {
  const totalCount = useContext(TotalCountContext);
  const isLast = useContext(IsLastContext);

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
      <div className="pregress-stopped"></div>
    </header>
  );
};

export default MainPageHeader;
