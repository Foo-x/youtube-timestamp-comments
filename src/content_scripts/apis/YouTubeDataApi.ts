export type PageResult = {
  comments: string[];
  totalCount: number;
  pageToken?: string;
};

export type YouTubeURL = URL & { readonly _: unique symbol };

type YouTubeCommentThreadsError = {
  error: {
    errors: Array<{
      reason: string;
    }>;
  };
};

type YouTubeCommentThreadsSuccess = {
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
  };
  items: Array<{
    snippet: {
      topLevelComment: {
        snippet: {
          textOriginal: string;
        };
      };
    };
  }>;
};

export const createUrl = (
  videoId: VideoId,
  key: ApiKey,
  pageToken?: string
): YouTubeURL => {
  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads');
  url.searchParams.append('part', 'snippet');
  url.searchParams.append('order', 'relevance');
  url.searchParams.append('maxResults', '100');
  url.searchParams.append('textFormat', 'plainText');
  url.searchParams.append('videoId', videoId);
  url.searchParams.append('key', key);

  if (pageToken) {
    url.searchParams.append('pageToken', pageToken);
  }

  return url as YouTubeURL;
};

export const fetchNextPage = async (
  url: YouTubeURL,
  currentCount: number
): Promise<PageResult | ErrorType> => {
  const res = await fetch(url.toString());
  if (!res.ok) {
    const { reason } = ((await res.json()) as YouTubeCommentThreadsError).error
      .errors[0];
    switch (reason) {
      case 'commentsDisabled':
        return 'comments-disabled';
      case 'forbidden':
      case 'badRequest':
        return 'invalid-api-key';
      default:
        return 'unknown';
    }
  }

  const resJson = (await res.json()) as YouTubeCommentThreadsSuccess;
  const pageToken = resJson.nextPageToken;
  const totalCount = currentCount + resJson.pageInfo.totalResults;
  const comments = resJson.items.map(
    (item) => item.snippet.topLevelComment.snippet.textOriginal
  );

  return { pageToken, totalCount, comments };
};
