import { Component } from "@wordpress/element";
import { locationToRoute } from "./utils";
import { history, RouterContext } from "./context";
import { Route } from "./route";
import { Link } from "./link";
import { match } from "path-to-regexp";

class Router extends Component {
  constructor(props) {
    super(props);

    // Convert our routes into an array for easy 404 checking
    this.routes = Object.keys(props.routes).map(
      (key) => props.routes[key].path
    );

    // Listen for path changes from the history API
    this.unlisten = history.listen(this.handleRouteChange);
    
    // Also listen for hash changes
    window.addEventListener('hashchange', this.handleHashChange);

    const route = locationToRoute(window.location);
    const { search } = window.location;

    // Define the initial RouterContext value
    this.state = {
      route,
      defaultRoute: props?.defaultRoute
        ? `${search}#${props?.defaultRoute}`
        : `${search}#/`,
    };
  }

  componentWillUnmount() {
    // Stop listening for changes if the Router component unmounts
    this.unlisten();
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  handleRouteChange = (location) => {
    const route = locationToRoute(location?.location || location);
    this.setState({ route: route });
  };

  handleHashChange = () => {
    const route = locationToRoute(window.location);
    this.setState({ route: route });
  };

  render() {
    // Define our variables
    const { children, NotFound } = this.props;
    const { route, defaultRoute } = this.state;

    console.log('Router render - route:', route, 'defaultRoute:', defaultRoute);

    // If no hash or empty hash, set to default route
    let currentRoute = route;
    if (!route.hash || route.hash === '#' || route.hash === '') {
      currentRoute = {
        ...route,
        hash: `#${this.props.defaultRoute}`
      };
      // Update the URL hash without triggering a page reload
      window.location.hash = `#${this.props.defaultRoute}`;
    }

    let matched = false;
    // match route - find the first matching route
    for (const routePath of this.routes || []) {
      const checkMatch = match(routePath);
      const hashPath = currentRoute.hash.substr(1);
      const isMatched = checkMatch(hashPath);
      console.log(`Router matching ${routePath} against ${hashPath}:`, isMatched);
      if (isMatched) {
        matched = {
          name: routePath,
          data: isMatched,
        };
        break; // Only match the first route
      }
    }

    const routerContextValue = { route: currentRoute, matched };

    // Check if 404 if no route matched
    const is404 = !matched;
    
    console.log('Router final state - matched:', matched, 'is404:', is404);

    return (
      <RouterContext.Provider value={routerContextValue}>
        {is404 ? <div>Not found</div> : children}
      </RouterContext.Provider>
    );
  }
}
export { history, RouterContext, Router, Route, Link };
