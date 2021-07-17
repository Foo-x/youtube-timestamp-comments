import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const configLink = useLocation().pathname === "/" ? "/config" : "/";

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-menu is-active is-flex">
          <div className="navbar-start flex-grow-1">
            <div className="navbar-item">0 / 100</div>
          </div>
          <div className="navbar-end">
            <a className="navbar-item">
              <span className="icon">
                <i className="fas fa-angle-right fa-lg" />
              </span>
            </a>
            <Link to={configLink} className="navbar-item">
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

export default Header;
