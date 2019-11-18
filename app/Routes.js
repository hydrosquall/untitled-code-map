import React from 'react';
import { Switch, Route } from "react-router-dom";

import routes from './constants/routes';
import App from './containers/App';

import PageRadialMap from './components/PageRadialMap';

export default () => (
  <App>
    <Switch>
      <Route
        path={routes.RADIAL_MAP}
        exact={true}
        render={() => <PageRadialMap />}
      />
      {/* Add other pages here */}
    </Switch>
  </App>
);
