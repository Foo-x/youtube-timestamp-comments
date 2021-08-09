import { useContext } from "react";
import Main from "../components/Main";
import MainPageHeader from "../components/MainPageHeader";
import { FetchedCommentsContext } from "../contexts/AppContext";

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
