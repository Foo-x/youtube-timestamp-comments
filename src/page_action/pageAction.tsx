import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "bulma-divider/dist/css/bulma-divider.min.css";
import "bulma/css/bulma.min.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import {
  Second2CommentsContext,
  TotalCountContext,
} from "./contexts/AppContext";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

type Msg = PageToPA | ViewPropsToPA;

const PageAction = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [s2c, setS2C] = useState<Second2Comments>(new Map());

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: Msg) => {
      console.log(msg);
      if (msg.type === "page") {
        setTotalCount(msg.totalCount);
        setS2C(
          new Map(
            Object.entries(msg.data).map(([sec, comments]) => [
              parseInt(sec),
              comments,
            ])
          )
        );
      }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, { type: "cache" });
    });
  }, []);

  return (
    <>
      <TotalCountContext.Provider value={totalCount}>
        <Second2CommentsContext.Provider value={s2c}>
          <Route exact path="/" component={MainPage} />
        </Second2CommentsContext.Provider>
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
