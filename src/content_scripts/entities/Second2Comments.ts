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

export const mergeS2C = (
  oldS2C: Second2Comments,
  newS2C: Second2Comments
): Second2Comments => {
  const result = new Map(oldS2C.entries()) as Second2Comments;
  newS2C.forEach((comments, second) => {
    if (result.has(second)) {
      result.set(second, [...result.get(second)!, ...comments]);
      return;
    }
    result.set(second, comments);
  });
  return result;
};

export const createS2C = (comments: string[]): Second2Comments => {
  return comments
    .map<[string, number[]]>((comment) => [
      comment,
      extractTimestampSeconds(comment),
    ])
    .map(([comment, seconds]) =>
      seconds.reduce((s2c, second) => {
        if (s2c.has(second)) {
          s2c.set(second, [...s2c.get(second)!, comment]);
          return s2c;
        }
        s2c.set(second, [comment]);
        return s2c;
      }, new Map<number, string[]>() as Second2Comments)
    )
    .reduce(mergeS2C);
};
