import { createContext } from "react";
import { createBrowserHistory } from "history";
import { locationToRoute } from "./utils";

export const history = createBrowserHistory();

// Initialize with current location
const initialRoute = locationToRoute(window.location);

export const RouterContext = createContext({
  route: initialRoute,
  matched: false,
});
