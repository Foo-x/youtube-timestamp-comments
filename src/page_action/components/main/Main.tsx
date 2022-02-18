import { secToTimeStr } from "pa/entities/Time";
import { updateTime } from "pa/modules/ChromeTabs";
import { useContext, useEffect } from "react";
import { FetchedCommentsStateContext } from "src/page_action/contexts/FetchedCommentsContext";
import { SelectedIdStateContext } from "src/page_action/contexts/SelectedIdContext";
import { SelectedSecondsStateContext } from "src/page_action/contexts/SelectedSecondsContext";
import MainSideMenu from "./MainSideMenu";

const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

const uniqueIndices = (
  fetchedComments: FetchedComments
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
      result.set(sec, [...result.get(sec)!, comment]);
      return;
    }
    result.set(sec, [comment]);
  });
  return result;
};

const timestampToSeconds = (timestamp: string): number => {
  const [first, second, third] = timestamp.split(":");
  const [h, m, s] =
    third === undefined
      ? [0, parseInt(first), parseInt(second)]
      : [parseInt(first), parseInt(second), parseInt(third)];
  return h * 3600 + m * 60 + s;
};

const replaceNewline = (text: string): JSX.Element => {
  return text
    .split("\n")
    .map((text_) => <>{text_}</>)
    .reduce((pre, cur) => (
      <>
        {pre}
        <br />
        {cur}
      </>
    ));
};

const replaceTimeLink = (comment: string): JSX.Element => {
  const resultArray: JSX.Element[] = [];

  let lastIndex = 0;
  let currentMatch: RegExpExecArray | null;
  while ((currentMatch = timestampPattern.exec(comment)) !== null) {
    resultArray.push(
      replaceNewline(comment.slice(lastIndex, currentMatch.index))
    );
    const timestamp = currentMatch[0];
    const seconds = timestampToSeconds(timestamp);
    resultArray.push(
      <a onClick={() => updateTime(seconds)} data-value={seconds}>
        {timestamp}
      </a>
    );
    lastIndex = timestampPattern.lastIndex;
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
    <div className="card" key={sec}>
      <header className="card-header has-background-light">
        <p className="card-header-title">
          <a onClick={() => updateTime(sec)}>{secToTimeStr(sec)}</a>
        </p>
      </header>
      <div className="card-content">
        {comments
          .map((comment) => <div key={comment}>{replaceTimeLink(comment)}</div>)
          .reduce((pre, cur) => (
            <>
              {pre}
              <div className="is-divider"></div>
              {cur}
            </>
          ))}
      </div>
    </div>
  );
};

const Main = () => {
  const fetchedComments = useContext(FetchedCommentsStateContext);
  const selectedId = useContext(SelectedIdStateContext);
  const selectedSeconds = useContext(SelectedSecondsStateContext);

  const content =
    selectedId === "ALL"
      ? Array.from(
          createS2C(
            uniqueIndices(fetchedComments).map(([sec, index]) => [
              sec,
              fetchedComments.comments[index],
            ])
          ).entries()
        ).map(([sec, comments]) => s2cToCommentCards(sec, comments))
      : s2cToCommentCards(
          fetchedComments.secondCommentIndexPairs[selectedId][0],
          [
            fetchedComments.comments[
              fetchedComments.secondCommentIndexPairs[selectedId][1]
            ],
          ]
        );
  useEffect(() => {
    if (selectedId === "ALL") {
      window.scroll(0, 0);
      return;
    }
    const timestampElement = document.querySelector(
      `[data-value="${selectedSeconds}"]`
    );
    if (timestampElement) {
      window.scrollBy(
        0,
        timestampElement.getBoundingClientRect().top -
          document.querySelector(".header")!.scrollHeight
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <main className="columns is-mobile is-gapless main-container" role="main">
      <MainSideMenu />
      <section className="column is-8">{content}</section>
    </main>
  );
};

export default Main;
