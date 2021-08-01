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
  IsLastContext,
  IsProgressContext,
  Second2CommentsContext,
  TotalCountContext,
} from "./contexts/AppContext";
import { sendMessage } from "./modules/ChromeTabs";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

const PageAction = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [s2c, setS2C] = useState<Second2Comments>(new Map());
  const [isLast, setIsLast] = useState(true);
  const [isProgress, setIsProgress] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: MsgToPA) => {
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
        setIsLast(msg.isLast);
        setIsProgress(false);
        return;
      }
      if (msg.type === "view-props") {
        window.scroll(0, msg.data.scroll);
        return;
      }
    });

    window.onblur = () => {
      sendMessage({
        type: "save-view-props",
        data: {
          scroll: window.scrollY,
          selectedSeconds: "",
          sideMenuScroll: 0,
        },
      });
    };

    setIsProgress(true);
    sendMessage({ type: "cache" });
  }, []);

  return (
    <>
      <TotalCountContext.Provider value={totalCount}>
        <Second2CommentsContext.Provider value={s2c}>
          <IsLastContext.Provider value={isLast}>
            <IsProgressContext.Provider value={[isProgress, setIsProgress]}>
              <Route exact path="/" component={MainPage} />
            </IsProgressContext.Provider>
          </IsLastContext.Provider>
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
