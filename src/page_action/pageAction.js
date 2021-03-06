import "bulma/css/bulma.min.css";
import "bulma-divider/dist/css/bulma-divider.min.css";
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";

import { Elm } from "./elm/src/Main.elm";
import { register } from "./elmPorts";

const app = Elm.Main.init({
  node: document.querySelector("main")
});

register(app);
