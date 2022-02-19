import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import 'bulma-divider/dist/css/bulma-divider.min.css';
import 'bulma/css/bulma.min.css';
import React, { useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  MemoryRouter as Router,
  Route,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';
import FetchedCommentsContextProvider, {
  FetchedCommentsDispatchContext,
} from './contexts/FetchedCommentsContext';
import IsApiKeyInvalidContextProvider, {
  IsApiKeyInvalidDispatchContext,
} from './contexts/IsApiKeyInvalidContext';
import IsLastContextProvider, {
  IsLastDispatchContext,
} from './contexts/IsLastContext';
import IsProgressContextProvider, {
  IsProgressDispatchContext,
} from './contexts/IsProgressContext';
import ScrollContextProvider, {
  ScrollDispatchContext,
  ScrollStateContext,
} from './contexts/ScrollContext';
import SelectedIdContextProvider, {
  SelectedIdDispatchContext,
  SelectedIdStateContext,
} from './contexts/SelectedIdContext';
import SelectedSecondsContextProvider from './contexts/SelectedSecondsContext';
import SideMenuRefContextProvider, {
  SideMenuRefStateContext,
} from './contexts/SideMenuRefContext';
import SideMenuScrollContextProvider, {
  SideMenuScrollDispatchContext,
  SideMenuScrollStateContext,
} from './contexts/SideMenuScrollContext';
import TotalCountContextProvider, {
  TotalCountDispatchContext,
} from './contexts/TotalCountContext';
import { initContentScript, sendMessage } from './modules/ChromeTabs';
import ConfigPage from './pages/config';
import MainPage from './pages/main';

const PageAction = () => {
  const location = useLocation();
  const history = useHistory();

  const setTotalCount = useContext(TotalCountDispatchContext);
  const setFetchedComments = useContext(FetchedCommentsDispatchContext);
  const setIsLast = useContext(IsLastDispatchContext);
  const setIsProgress = useContext(IsProgressDispatchContext);
  const scroll = useContext(ScrollStateContext);
  const setScroll = useContext(ScrollDispatchContext);
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const setSideMenuScroll = useContext(SideMenuScrollDispatchContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const setSelectedId = useContext(SelectedIdDispatchContext);
  const setIsApiKeyInvalid = useContext(IsApiKeyInvalidDispatchContext);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: MsgToPA) => {
      if (msg.type === 'page') {
        setTotalCount(msg.totalCount);
        setFetchedComments(msg.data);
        setIsLast(msg.isLast);
        setIsProgress(false);
        return;
      }
      if (msg.type === 'view-props') {
        setScroll(msg.data.scroll);
        setSideMenuScroll(msg.data.sideMenuScroll);
        setSelectedId(msg.data.selectedId);
        return;
      }
      if (msg.type === 'error') {
        setIsProgress(false);
        if (msg.data === 'comments-disabled') {
          setTotalCount(0);
          setIsLast(true);
          return;
        }
        if (msg.data === 'unknown') {
          setIsLast(true);
          return;
        }
        setIsApiKeyInvalid(true);
        history.push('/config');
      }
    });

    setIsProgress(true);
    void initContentScript().then(() => {
      void sendMessage({ type: 'cache' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.onblur = () => {
      void sendMessage({
        type: 'save-view-props',
        data: {
          scroll: location.pathname === '/' ? window.scrollY : scroll,
          sideMenuScroll:
            location.pathname === '/'
              ? sideMenuRef.current?.scrollTop ?? sideMenuScroll
              : sideMenuScroll,
          selectedId,
        },
      });
    };
  }, [location.pathname, scroll, sideMenuScroll, selectedId, sideMenuRef]);
  useEffect(() => {
    if (location.pathname === '/') {
      window.scroll(0, scroll);
    }
  }, [location.pathname, scroll]);

  return (
    <>
      <Route exact path='/'>
        <MainPage />
      </Route>
      <Route exact path='/config'>
        <ConfigPage />
      </Route>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <TotalCountContextProvider>
          <FetchedCommentsContextProvider>
            <IsLastContextProvider>
              <IsProgressContextProvider>
                <ScrollContextProvider>
                  <SideMenuScrollContextProvider>
                    <SideMenuRefContextProvider>
                      <SelectedIdContextProvider>
                        <SelectedSecondsContextProvider>
                          <IsApiKeyInvalidContextProvider>
                            <PageAction />
                          </IsApiKeyInvalidContextProvider>
                        </SelectedSecondsContextProvider>
                      </SelectedIdContextProvider>
                    </SideMenuRefContextProvider>
                  </SideMenuScrollContextProvider>
                </ScrollContextProvider>
              </IsProgressContextProvider>
            </IsLastContextProvider>
          </FetchedCommentsContextProvider>
        </TotalCountContextProvider>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
