import Config from "pa/components/config/Config";
import ConfigPageHeader from "pa/components/config/ConfigPageHeader";

const ConfigPage = () => {
  return (
    <div className="page-action-with-comments">
      <ConfigPageHeader />
      <Config />
    </div>
  );
};

export default ConfigPage;
