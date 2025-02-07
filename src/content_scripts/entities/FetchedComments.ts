const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

const extractTimestampSeconds = (comment: string): number[] => {
  const timestamps = comment.match(timestampPattern);
  if (timestamps === null) {
    return [];
  }

  return Array.from(
    new Set(
      timestamps.map((timestamp) => {
        const [first, second, third] = timestamp.split(':');
        const [h, m, s] =
          third === undefined
            ? [0, parseInt(first, 10), parseInt(second, 10)]
            : [parseInt(first, 10), parseInt(second, 10), parseInt(third, 10)];
        return h * 3600 + m * 60 + s;
      }),
    ),
  );
};

export const createFetchedComments = (comments: string[]): FetchedComments => {
  const commentSecondsPairs = comments
    .map(
      (comment) =>
        [comment, extractTimestampSeconds(comment)] as [string, number[]],
    )
    .filter(([_, seconds]) => seconds.length > 0);
  const secondCommentIndexPairs = commentSecondsPairs
    .flatMap(([_, seconds], index) => {
      return seconds.map<[number, number]>((second) => [second, index]);
    })
    .sort(([aSec, aIndex], [bSec, bIndex]) => {
      // sort by second, if same second, sort by index
      return aSec - bSec || aIndex - bIndex;
    });
  return {
    comments: commentSecondsPairs.map(([comment]) => comment),
    secondCommentIndexPairs,
  };
};
