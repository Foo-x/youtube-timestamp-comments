import Config from "../components/Config";
import ConfigPageHeader from "../components/ConfigPageHeader.1";

const ConfigPage = () => {
  return (
    <div className="page-action-with-comments">
      <ConfigPageHeader />
      <Config />
    </div>
  );
};

export default ConfigPage;
