const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

const extractTimestampSeconds = (comment: string): number[] => {
  const timestamps = comment.match(timestampPattern);
  if (timestamps === null) {
    return [];
  }

  return Array.from(
    new Set(
      timestamps.map((timestamp) => {
        const [first, second, third] = timestamp.split(":");
        const [h, m, s] =
          third === undefined
            ? [0, parseInt(first), parseInt(second)]
            : [parseInt(first), parseInt(second), parseInt(third)];
        return h * 3600 + m * 60 + s;
      })
    )
  );
};

export const createFetchedComments = (comments: string[]): FetchedComments => {
  const commentSecondsPairs = comments
    .map(
      (comment) =>
        [comment, extractTimestampSeconds(comment)] as [string, number[]]
    )
    .filter(([_, seconds]) => seconds.length > 0);
  const secondCommentIndexPairs = commentSecondsPairs
    .map(([_, seconds], index) => {
      return seconds.map((second) => [second, index]) as [number, number][];
    })
    .flat()
    .sort(([aSec, aIndex], [bSec, bIndex]) => {
      return aSec - bSec || aIndex - bIndex;
    });
  return {
    comments: commentSecondsPairs.map(([comment]) => comment),
    secondCommentIndexPairs,
  };
};
