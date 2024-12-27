import { Container, UseHooks, View } from '@foo-x/react-container';
import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import 'bulma-divider/dist/css/bulma-divider.min.css';
import 'bulma/css/bulma.min.css';
import React, { useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Route,
  MemoryRouter as Router,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { getTheme } from 'src/modules/ChromeStorage';
import CurrentTimeContextProvider, {
  CurrentTimeDispatchContext,
} from './contexts/CurrentTimeContext';
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
import SelectedIdContextProvider from './contexts/SelectedIdContext';
import SelectedSecondsContextProvider from './contexts/SelectedSecondsContext';
import TotalCountContextProvider, {
  TotalCountDispatchContext,
} from './contexts/TotalCountContext';
import { updateTheme } from './entities/Theme';
import {
  contentTabId,
  initContentScript,
  sendMessage,
} from './modules/ChromeTabs';
import ConfigPage from './pages/config';
import MainPage from './pages/main';

type Props = unknown;

type HooksResult = unknown;

const healthCheckInterval = 1000;

const useHooks: UseHooks<Props, HooksResult> = () => {
  const navigate = useNavigate();

  const setTotalCount = useContext(TotalCountDispatchContext);
  const setCurrentTime = useContext(CurrentTimeDispatchContext);
  const setFetchedComments = useContext(FetchedCommentsDispatchContext);
  const setIsLast = useContext(IsLastDispatchContext);
  const setIsProgress = useContext(IsProgressDispatchContext);
  const setIsApiKeyInvalid = useContext(IsApiKeyInvalidDispatchContext);

  useEffect(() => {
    // centralize handling of received values using `onMessage`, unlike message sending
    chrome.runtime.onMessage.addListener((msg: MsgToPA) => {
      if (msg.type === 'page' && msg.tabId === contentTabId) {
        setTotalCount(msg.totalCount);
        setFetchedComments(msg.data);
        setIsLast(msg.isLast);
        setIsProgress(false);
        return;
      }
      if (msg.type === 'current-time' && msg.tabId === contentTabId) {
        setCurrentTime({
          currentTime: msg.currentTime,
          duration: msg.duration,
        });
        return;
      }
      if (msg.type === 'error' && msg.tabId === contentTabId) {
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
        navigate('/config');
      }
    });

    setIsProgress(true);
    void initContentScript().then(() => {
      void sendMessage({ type: 'cache' });
    });

    const title = new URLSearchParams(window.location.search).get('title');
    if (title) {
      if (process.env.NODE_ENV === 'development') {
        document.title = `(dev) ${title}`;
      } else {
        document.title = title;
      }
    }

    void getTheme().then(updateTheme);

    let videoId: VideoId;
    const healthCheck = () => {
      void sendMessage<HealthCheckToPA>({ type: 'health-check' })
        .then((result) => {
          if (result.tabId !== contentTabId) {
            return;
          }
          if (!videoId) {
            videoId = result.videoId;
            setTimeout(healthCheck, healthCheckInterval);
            return;
          }
          if (result.videoId !== videoId) {
            window.close();
            return;
          }
          setTimeout(healthCheck, healthCheckInterval);
        })
        // YouTube tab is closed before the page action window is closed
        .catch(() => {
          if (videoId) {
            window.close();
          } else {
            setTimeout(healthCheck, healthCheckInterval);
          }
        });
    };
    healthCheck();
  }, []);
};

const view: View<Props, HooksResult> = () => {
  return (
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/config' element={<ConfigPage />} />
    </Routes>
  );
};

const PageAction = Container({ useHooks, view });

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Router>
      <TotalCountContextProvider>
        <CurrentTimeContextProvider>
          <FetchedCommentsContextProvider>
            <IsLastContextProvider>
              <IsProgressContextProvider>
                <SelectedSecondsContextProvider>
                  <SelectedIdContextProvider>
                    <IsApiKeyInvalidContextProvider>
                      <PageAction />
                    </IsApiKeyInvalidContextProvider>
                  </SelectedIdContextProvider>
                </SelectedSecondsContextProvider>
              </IsProgressContextProvider>
            </IsLastContextProvider>
          </FetchedCommentsContextProvider>
        </CurrentTimeContextProvider>
      </TotalCountContextProvider>
    </Router>
  </React.StrictMode>,
);
