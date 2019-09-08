import { Elm } from "./elm/src/Main.elm";
import { register } from "./elmPorts";

const app = Elm.Main.init();

register(app);
