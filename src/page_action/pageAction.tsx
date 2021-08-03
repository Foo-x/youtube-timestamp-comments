import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "bulma-divider/dist/css/bulma-divider.min.css";
import "bulma/css/bulma.min.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  MemoryRouter as Router,
  Route,
  Switch,
  useHistory,
  useLocation,
} from "react-router-dom";
import {
  IsApiKeyInvalidContext,
  IsLastContext,
  IsProgressContext,
  ScrollContext,
  Second2CommentsContext,
  SelectedSecondsContext,
  SideMenuScrollContext,
  TotalCountContext,
} from "./contexts/AppContext";
import { sendMessage } from "./modules/ChromeTabs";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

const PageAction = () => {
  const location = useLocation();
  const history = useHistory();

  const [totalCount, setTotalCount] = useState(0);
  const [s2c, setS2C] = useState<Second2Comments>(new Map());
  const [isLast, setIsLast] = useState(false);
  const [isProgress, setIsProgress] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [sideMenuScroll, setSideMenuScroll] = useState(0);
  const [selectedSeconds, setSelectedSeconds] =
    useState<SelectedSeconds>("ALL");
  const [isApiKeyInvalid, setIsApiKeyInvalid] = useState(false);

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
        setScroll(msg.data.scroll);
        setSideMenuScroll(msg.data.sideMenuScroll);
        setSelectedSeconds(msg.data.selectedSeconds);
        return;
      }
      if (msg.type === "error") {
        setIsProgress(false);
        if (msg.data === "comments-disabled") {
          setTotalCount(0);
          setS2C(new Map());
          setIsLast(true);
          return;
        }
        if (msg.data === "unknown") {
          setIsLast(true);
          return;
        }
        setIsApiKeyInvalid(true);
        history.push("/config");
        return;
      }
    });

    setIsProgress(true);
    sendMessage({ type: "cache" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.onblur = () => {
      sendMessage({
        type: "save-view-props",
        data: {
          scroll: location.pathname === "/" ? window.scrollY : scroll,
          sideMenuScroll,
          selectedSeconds,
        },
      });
    };
  }, [location.pathname, scroll, sideMenuScroll, selectedSeconds]);
  useEffect(() => {
    if (location.pathname === "/") {
      window.scroll(0, scroll);
    }
  }, [location.pathname, scroll]);

  return (
    <>
      <TotalCountContext.Provider value={totalCount}>
        <Second2CommentsContext.Provider value={s2c}>
          <IsLastContext.Provider value={isLast}>
            <IsProgressContext.Provider value={[isProgress, setIsProgress]}>
              <ScrollContext.Provider value={[scroll, setScroll]}>
                <SideMenuScrollContext.Provider
                  value={[sideMenuScroll, setSideMenuScroll]}
                >
                  <SelectedSecondsContext.Provider
                    value={[selectedSeconds, setSelectedSeconds]}
                  >
                    <Route exact path="/">
                      <MainPage />
                    </Route>
                  </SelectedSecondsContext.Provider>
                </SideMenuScrollContext.Provider>
              </ScrollContext.Provider>
            </IsProgressContext.Provider>
          </IsLastContext.Provider>
        </Second2CommentsContext.Provider>
      </TotalCountContext.Provider>
      <IsApiKeyInvalidContext.Provider
        value={[isApiKeyInvalid, setIsApiKeyInvalid]}
      >
        <Route exact path="/config" component={ConfigPage} />
      </IsApiKeyInvalidContext.Provider>
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
