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

type ViewProps = {
  scroll: number;
  sideMenuScroll: number;
  selectedId: SelectedId;
};

// message from page_action to content_scripts
type CacheToCS = {
  type: 'cache';
};
type NextPageToCS = {
  type: 'next-page';
};
type SaveViewPropsToCS = {
  type: 'save-view-props';
  data: ViewProps;
};
type MsgToCS = CacheToCS | NextPageToCS | SaveViewPropsToCS;

// message from content_scripts to page_action
type PageToPA = {
  type: 'page';
  data: FetchedComments;
  totalCount: number;
  isLast: boolean;
};
type ViewPropsToPA = {
  type: 'view-props';
  data: ViewProps;
};
type ErrorToPA = {
  type: 'error';
  data: ErrorType;
};
type MsgToPA = PageToPA | ViewPropsToPA | ErrorToPA;
