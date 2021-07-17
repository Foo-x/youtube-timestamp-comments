const Config = () => {
  return (
    <main className="config main-container" role="main">
      <section className="section">
        <div className="field">
          <label className="label" htmlFor="api-key-input">
            API Key
          </label>
          <div className="control">
            <input
              id="api-key-input"
              name="api-key-input"
              className="api-key-input input"
              type="text"
              placeholder="AIza..."
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Config;
