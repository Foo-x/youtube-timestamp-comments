import { Link } from "react-router-dom";

const ConfigPageHeader = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="config-header-menu navbar-menu is-flex">
          <div className="navbar-end">
            <Link to="/" className="navbar-item">
              <span className="icon active">
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

export default ConfigPageHeader;
