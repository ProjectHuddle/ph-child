import { useContext, cloneElement } from "react";
import { RouterContext } from "./context";
import { match } from "path-to-regexp";
let prev = "";

export function Route({ path, onRoute, children }) {
  // Extract route from RouterContext
  const { route, matched } = useContext(RouterContext);

  // Check if this route path matches the Router's matched route
  const isMatched = matched && matched.name === path;

  console.log(`Route ${path}: matched route="${matched?.name}", isMatched=`, isMatched);

  if (!isMatched) {
    return null;
  }

  const hashPath = route.hash.substr(1);
  if (onRoute) {
    if (prev !== hashPath) {
      onRoute();
    }
    prev = hashPath;
  }

  return <div>{cloneElement(children, { route: matched.data })}</div>;
}
