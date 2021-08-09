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
  FetchedCommentsContext,
  IsApiKeyInvalidContext,
  IsLastContext,
  IsProgressContext,
  ScrollContext,
  SelectedIdContext,
  SelectedSecondsContext,
  SideMenuScrollContext,
  TotalCountContext,
} from "./contexts/AppContext";
import { initContentScript, sendMessage } from "./modules/ChromeTabs";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

const PageAction = () => {
  const location = useLocation();
  const history = useHistory();

  const [totalCount, setTotalCount] = useState(0);
  const [fetchedComments, setFetchedComments] = useState<FetchedComments>({
    comments: [],
    secondCommentIndexPairs: [],
  });
  const [isLast, setIsLast] = useState(false);
  const [isProgress, setIsProgress] = useState(false);
  const [scroll, setScroll] = useState(0);
  const [sideMenuScroll, setSideMenuScroll] = useState(0);
  const [selectedId, setSelectedId] = useState<SelectedId>("ALL");
  const [selectedSeconds, setSelectedSeconds] =
    useState<SelectedSeconds>("ALL");
  const [isApiKeyInvalid, setIsApiKeyInvalid] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: MsgToPA) => {
      if (msg.type === "page") {
        setTotalCount(msg.totalCount);
        setFetchedComments(msg.data);
        setIsLast(msg.isLast);
        setIsProgress(false);
        return;
      }
      if (msg.type === "view-props") {
        setScroll(msg.data.scroll);
        setSideMenuScroll(msg.data.sideMenuScroll);
        setSelectedId(msg.data.selectedId);
        return;
      }
      if (msg.type === "error") {
        setIsProgress(false);
        if (msg.data === "comments-disabled") {
          setTotalCount(0);
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
    initContentScript().then(() => {
      sendMessage({ type: "cache" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.onblur = () => {
      sendMessage({
        type: "save-view-props",
        data: {
          scroll: location.pathname === "/" ? window.scrollY : scroll,
          sideMenuScroll,
          selectedId,
        },
      });
    };
  }, [location.pathname, scroll, sideMenuScroll, selectedId]);
  useEffect(() => {
    if (location.pathname === "/") {
      window.scroll(0, scroll);
    }
  }, [location.pathname, scroll]);

  return (
    <>
      <TotalCountContext.Provider value={totalCount}>
        <FetchedCommentsContext.Provider value={fetchedComments}>
          <IsLastContext.Provider value={isLast}>
            <IsProgressContext.Provider value={[isProgress, setIsProgress]}>
              <ScrollContext.Provider value={[scroll, setScroll]}>
                <SideMenuScrollContext.Provider
                  value={[sideMenuScroll, setSideMenuScroll]}
                >
                  <SelectedIdContext.Provider
                    value={[selectedId, setSelectedId]}
                  >
                    <SelectedSecondsContext.Provider
                      value={[selectedSeconds, setSelectedSeconds]}
                    >
                      <Route exact path="/">
                        <MainPage />
                      </Route>
                    </SelectedSecondsContext.Provider>
                  </SelectedIdContext.Provider>
                </SideMenuScrollContext.Provider>
              </ScrollContext.Provider>
            </IsProgressContext.Provider>
          </IsLastContext.Provider>
        </FetchedCommentsContext.Provider>
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
