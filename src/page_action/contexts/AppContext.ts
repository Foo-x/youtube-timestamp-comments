import React from "react";

export const TotalCountContext = React.createContext(0);

export const Second2CommentsContext = React.createContext<Second2Comments>(
  new Map()
);

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

export const SelectedSecondsContext = React.createContext<
  [SelectedSeconds, (selectedSeconds: SelectedSeconds) => void]
>(["ALL", () => {}]);
