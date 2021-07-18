import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "bulma-divider/dist/css/bulma-divider.min.css";
import "bulma/css/bulma.min.css";
import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import ConfigPage from "./pages/ConfigPage";
import MainPage from "./pages/MainPage";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/" component={MainPage} />
        <Route exact path="/config" component={ConfigPage} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
