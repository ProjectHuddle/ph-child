import { Router, Route, Link } from './index';
import Dashboard from '../views/Dashboard';
import Settings from '../views/Settings';


const CustomRouter = () => (
  <Router routes={routes} defaultRoute={routes?.dashboard?.path}>
    <Route path={routes.dashboard.path}><Dashboard /></Route>
    <Route path={routes.settings.path}><Settings /></Route>
  </Router>
);

export default CustomRouter;
