import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "bulma-divider/dist/css/bulma-divider.min.css";
import "bulma/css/bulma.min.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import { TotalCountContext } from "./contexts/AppContext";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

type Msg = PageToPA | ViewPropsToPA;

const PageAction = () => {
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: Msg) => {
      console.log(msg);
      if (msg.type === "page") {
        setTotalCount(msg.totalCount);
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { type: "cache" });
    });
  }, []);

  return (
    <>
      <TotalCountContext.Provider value={totalCount}>
        <Route exact path="/" component={MainPage} />
      </TotalCountContext.Provider>
      <Route exact path="/config" component={ConfigPage} />
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <PageAction />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
