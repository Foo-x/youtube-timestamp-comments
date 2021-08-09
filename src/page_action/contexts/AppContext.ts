import React from "react";

export const TotalCountContext = React.createContext(0);

export const FetchedCommentsContext = React.createContext<FetchedComments>({
  comments: [],
  secondCommentIndexPairs: [],
});

export const IsLastContext = React.createContext(false);

export const IsProgressContext = React.createContext<
  [boolean, (isProgress: boolean) => void]
>([false, () => {}]);

export const ScrollContext = React.createContext<
  [number, (scroll: number) => void]
>([0, () => {}]);

export const SideMenuScrollContext = React.createContext<
  [number, (sideMenuScroll: number) => void]
>([0, () => {}]);

export const SelectedIdContext = React.createContext<
  [SelectedSeconds, (selectedSeconds: SelectedId) => void]
>(["ALL", () => {}]);

export const IsApiKeyInvalidContext = React.createContext<
  [boolean, (isApiKeyInvalid: boolean) => void]
>([false, () => {}]);
