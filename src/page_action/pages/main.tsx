import Main from "pa/components/main/Main";
import MainPageHeader from "pa/components/main/MainPageHeader";
import { FetchedCommentsContext } from "pa/contexts/AppContext";
import { useContext } from "react";

const MainPage = () => {
  const fetchedComments = useContext(FetchedCommentsContext);

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
