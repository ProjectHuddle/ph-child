import { Router, Route, Link } from './index';
import Dashboard from '../views/Dashboard';
import Settings from '../views/Settings';
import Connections from '../views/Connections';
import ConnectView from '../views/ConnectView';
import { routes } from '../admin/settings/routes';


const CustomRouter = () => {
  console.log('CustomRouter rendering with routes:', routes);
  return (
    <Router routes={routes} defaultRoute={routes?.dashboard?.path}>
      <Route path={routes.dashboard.path}><Dashboard /></Route>
      <Route path={routes.settings.path}><Settings /></Route>
      <Route path={routes.connection.path}><Connections /></Route>
      <Route path={routes.connect.path}><ConnectView /></Route>
    </Router>
  );
};

export default CustomRouter;
