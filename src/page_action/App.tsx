import Header from "./components/Header";
import Main from "./components/Main";
import { Route, MemoryRouter as Router, Switch } from "react-router-dom";
import Config from "./components/Config";

const App = () => {
  return (
    <Router>
      <div className="page-action-with-comments">
        <Header />
        <Switch>
          <Route exact path="/" component={Main} />
          <Route exact path="/config" component={Config} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
