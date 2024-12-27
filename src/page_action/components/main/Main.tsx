import { Container, UseHooks, View } from '@foo-x/react-container';
import { secToTimeStr } from 'pa/entities/Time';
import { updateTime } from 'pa/modules/ChromeTabs';
import {
  ReactElement,
  ReactNode,
  memo,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { FetchedCommentsStateContext } from 'src/page_action/contexts/FetchedCommentsContext';
import { SelectedIdStateContext } from 'src/page_action/contexts/SelectedIdContext';
import { SelectedSecondsStateContext } from 'src/page_action/contexts/SelectedSecondsContext';
import MainSideMenu from './MainSideMenu';
import SequenceBar from './SequenceBar';

const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

type Props = unknown;

type HooksResult = {
  content: ReactElement | ReactElement[];
};

const uniqueIndices = (
  fetchedComments: FetchedComments,
): [number, number][] => {
  const indexSet = new Set<number>();
  const result: [number, number][] = [];
  fetchedComments.secondCommentIndexPairs.forEach(([sec, index]) => {
    if (indexSet.has(index)) {
      return;
    }
    indexSet.add(index);
    result.push([sec, index]);
  });
  return result;
};

const createS2C = (secondCommentPairs: [number, string][]): Second2Comments => {
  const result = new Map<number, string[]>();
  secondCommentPairs.forEach(([sec, comment]) => {
    if (result.has(sec)) {
      result.set(sec, [...(result.get(sec) ?? []), comment]);
      return;
    }
    result.set(sec, [comment]);
  });
  return result;
};

const timestampToSeconds = (timestamp: string): number => {
  const [first, second, third] = timestamp.split(':');
  const [h, m, s] =
    third === undefined
      ? [0, parseInt(first, 10), parseInt(second, 10)]
      : [parseInt(first, 10), parseInt(second, 10), parseInt(third, 10)];
  return h * 3600 + m * 60 + s;
};

const replaceNewline = (text: string): ReactNode => {
  return text
    .split('\n')
    .map<ReactNode>((text_) => text_)
    .reduce((pre, cur) => (
      <>
        {pre}
        <br />
        {cur}
      </>
    ));
};

const replaceTimeLink = (comment: string): ReactNode => {
  const resultArray: ReactNode[] = [];

  let lastIndex = 0;
  let currentMatch: RegExpExecArray | null;
  currentMatch = timestampPattern.exec(comment);
  while (currentMatch !== null) {
    resultArray.push(
      replaceNewline(comment.slice(lastIndex, currentMatch.index)),
    );
    const timestamp = currentMatch[0];
    const seconds = timestampToSeconds(timestamp);
    resultArray.push(
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <a
        role='button'
        tabIndex={0}
        onClick={() => updateTime(seconds)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateTime(seconds);
          }
        }}
        data-value={seconds}
      >
        {timestamp}
      </a>,
    );
    lastIndex = timestampPattern.lastIndex;
    currentMatch = timestampPattern.exec(comment);
  }
  resultArray.push(replaceNewline(comment.slice(lastIndex)));

  return resultArray.reduce((pre, cur) => (
    <>
      {pre}
      {cur}
    </>
  ));
};

const s2cToCommentCards = (sec: number, comments: string[]): JSX.Element => {
  return (
    <div className='card' key={`${sec}-${comments[0]}`}>
      <header className='card-header has-background'>
        <p className='card-header-title'>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            role='button'
            tabIndex={0}
            onClick={() => updateTime(sec)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateTime(sec);
              }
            }}
          >
            {secToTimeStr(sec)}
          </a>
        </p>
      </header>
      <div className='card-content'>
        {comments
          .map((comment) => <div key={comment}>{replaceTimeLink(comment)}</div>)
          .reduce((pre, cur) => (
            <>
              {pre}
              <div className='is-divider' />
              {cur}
            </>
          ))}
      </div>
    </div>
  );
};

export const useHooks: UseHooks<Props, HooksResult> = () => {
  const fetchedComments = useContext(FetchedCommentsStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const selectedSeconds = useContext(SelectedSecondsStateContext);

  useEffect(() => {
    if (selectedId === 'ALL') {
      window.scroll(0, 0);
      return;
    }
    const timestampElement = document.querySelector(
      `[data-value="${selectedSeconds}"]`,
    );
    if (timestampElement) {
      window.scrollBy(
        0,
        timestampElement.getBoundingClientRect().top -
          (document.querySelector('.header')?.scrollHeight ?? 0),
      );
    }
  }, [selectedId]);

  const content = useMemo(() => {
    return selectedId === 'ALL'
      ? Array.from(
          createS2C(
            uniqueIndices(fetchedComments).map(([sec, index]) => [
              sec,
              fetchedComments.comments[index],
            ]),
          ).entries(),
        ).map(([sec, comments]) => s2cToCommentCards(sec, comments))
      : s2cToCommentCards(
          fetchedComments.secondCommentIndexPairs[selectedId][0],
          [
            fetchedComments.comments[
              fetchedComments.secondCommentIndexPairs[selectedId][1]
            ],
          ],
        );
  }, [fetchedComments, selectedId]);

  return { content };
};

export const view: View<Props, HooksResult> = ({
  hooksResult: { content },
}) => {
  return (
    <main className='main-container' role='main'>
      <div>
        <SequenceBar />
      </div>
      <div className='columns is-mobile is-gapless main-comments-container'>
        <MainSideMenu />
        <section className='column comments'>{content}</section>
      </div>
    </main>
  );
};

const Main = Container({ useHooks, view });

export default memo(Main);
