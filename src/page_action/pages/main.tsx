import Main from "pa/components/main/Main";
import MainPageHeader from "pa/components/main/MainPageHeader";
import { useContext } from "react";
import { FetchedCommentsStateContext } from "../contexts/FetchedCommentsContext";

const MainPage = () => {
  const fetchedComments = useContext(FetchedCommentsStateContext);

  return (
    <div
      className={
        fetchedComments.comments.length === 0
          ? "page-action-without-comments"
          : "page-action-with-comments"
      }
    >
      <MainPageHeader />
      <Main />
    </div>
  );
};

export default MainPage;
