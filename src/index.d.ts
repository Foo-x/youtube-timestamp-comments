type ApiKey = string & { readonly _: unique symbol };
type VideoId = string & { readonly _: unique symbol };
type FetchedComments = {
  comments: string[];
  secondCommentIndexPairs: [number, number][];
};
type Second2Comments = Map<number, string[]>;
type SelectedSeconds = 'ALL' | number;
type SelectedId = 'ALL' | number;
type ErrorType = 'invalid-api-key' | 'comments-disabled' | 'unknown';
type WithTabId<T> = T & {
  tabId: number;
};
type Theme = 'device' | 'light' | 'dark';

// message from page_action to content_scripts
type CacheToCS = WithTabId<{
  type: 'cache';
}>;
type NextPageToCS = WithTabId<{
  type: 'next-page';
}>;
type HealthCheckToCS = WithTabId<{
  type: 'health-check';
}>;
type MsgToCS = CacheToCS | NextPageToCS | HealthCheckToCS;

// message from content_scripts to page_action
type PageToPA = WithTabId<{
  type: 'page';
  data: FetchedComments;
  totalCount: number;
  isLast: boolean;
}>;
type ErrorToPA = WithTabId<{
  type: 'error';
  data: ErrorType;
}>;
type CurrentTimeToPA = WithTabId<{
  type: 'current-time';
  currentTime: number;
  duration: number;
}>;
type HealthCheckToPA = WithTabId<{
  type: 'health-check';
  videoId: VideoId;
}>;
type MsgToPA = PageToPA | ErrorToPA | CurrentTimeToPA | HealthCheckToPA;
