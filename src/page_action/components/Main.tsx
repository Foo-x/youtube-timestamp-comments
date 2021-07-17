const Main = () => {
  return (
    <main
      className="columns is-mobile is-gapless content-container"
      role="main"
    >
      <aside className="menu column is-4">
        <ul id="side-menu-list" className="menu-list side-menu-list">
          <li>
            <a className="is-active">ALL</a>
          </li>
        </ul>
      </aside>
      <section className="column is-8">
        <div className="card">
          <header className="card-header has-background-light">
            <p className="card-header-title">1:23</p>
          </header>
          <div className="card-content">
            <div>foo</div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Main;
