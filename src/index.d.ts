type ApiKey = string & { readonly _: unique symbol };
type VideoId = string & { readonly _: unique symbol };
type Second2Comments = Map<number, string[]>;

type ViewProps = {
  scroll: number;
  sideMenuScroll: number;
  selectedSeconds: string;
};

// message from page_action to content_scripts
type CacheToCS = { type: "cache" };
type NextPageToCS = { type: "next-page" };
type SaveViewPropsToCS = { type: "save-view-props"; data: ViewProps };

// message from content_scripts to page_action
type PageToPA = {
  type: "page";
  data: { [second: string]: string[] };
  totalCount: number;
  isLast: boolean;
};
type ViewPropsToPA = { type: "view-props"; data: ViewProps };
