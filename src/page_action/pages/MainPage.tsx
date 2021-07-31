import { useContext } from "react";
import Main from "../components/Main";
import MainPageHeader from "../components/MainPageHeader";
import { Second2CommentsContext } from "../contexts/AppContext";

const MainPage = () => {
  const s2c = useContext(Second2CommentsContext);

  return (
    <div
      className={
        s2c.size === 0
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
