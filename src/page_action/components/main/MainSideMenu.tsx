import { Container, UseHooks, View } from '@foo-x/react-container';
import { secToTimeStr } from 'pa/entities/Time';
import { updateTime } from 'pa/modules/ChromeTabs';
import { RefObject, useContext, useEffect } from 'react';
import { FetchedCommentsStateContext } from 'src/page_action/contexts/FetchedCommentsContext';
import {
  SelectedIdDispatchContext,
  SelectedIdStateContext,
} from 'src/page_action/contexts/SelectedIdContext';
import { SelectedSecondsDispatchContext } from 'src/page_action/contexts/SelectedSecondsContext';
import { SideMenuRefStateContext } from 'src/page_action/contexts/SideMenuRefContext';
import { SideMenuScrollStateContext } from 'src/page_action/contexts/SideMenuScrollContext';

type Props = unknown;

type HooksResult = {
  secondCommentIndexPairs: [number, number][];
  sideMenuRef: RefObject<HTMLUListElement>;
  selectedId: SelectedId;
  setSelectedId: (v: SelectedId) => void;
  setSelectedSeconds: (v: SelectedSeconds) => void;
};

export const useHooks: UseHooks<Props, HooksResult> = () => {
  const { secondCommentIndexPairs } = useContext(FetchedCommentsStateContext);
  const sideMenuScroll = useContext(SideMenuScrollStateContext);
  const sideMenuRef = useContext(SideMenuRefStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const setSelectedId = useContext(SelectedIdDispatchContext);
  const setSelectedSeconds = useContext(SelectedSecondsDispatchContext);

  useEffect(() => {
    sideMenuRef.current?.scroll(0, sideMenuScroll);
  }, [sideMenuScroll, sideMenuRef]);

  return {
    secondCommentIndexPairs,
    sideMenuRef,
    selectedId,
    setSelectedId,
    setSelectedSeconds,
  };
};

export const view: View<Props, HooksResult> = ({
  hooksResult: {
    secondCommentIndexPairs,
    sideMenuRef,
    selectedId,
    setSelectedId,
    setSelectedSeconds,
  },
}) => {
  return (
    <aside className='menu column is-4'>
      <ul
        id='side-menu-list'
        className='menu-list side-menu-list'
        ref={sideMenuRef}
      >
        <li>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            role='button'
            tabIndex={0}
            className={selectedId === 'ALL' ? 'is-active' : ''}
            onClick={() => {
              setSelectedId('ALL');
              setSelectedSeconds('ALL');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSelectedId('ALL');
                setSelectedSeconds('ALL');
              }
            }}
          >
            ALL
          </a>
        </li>
        {secondCommentIndexPairs.map(([sec], id) => {
          const timeStr = secToTimeStr(sec);
          const button =
            selectedId === id ? (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                role='button'
                tabIndex={0}
                className='is-active'
                onClick={() => updateTime(sec)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateTime(sec);
                  }
                }}
              >
                {timeStr}
              </a>
            ) : (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                role='button'
                tabIndex={0}
                onClick={() => {
                  setSelectedId(id);
                  setSelectedSeconds(sec);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedId(id);
                    setSelectedSeconds(sec);
                  }
                }}
              >
                {timeStr}
              </a>
            );
          return <li key={sec}>{button}</li>;
        })}
      </ul>
    </aside>
  );
};

const MainSideMenu = Container({ useHooks, view });

export default MainSideMenu;
