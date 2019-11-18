import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';

import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

import Routes from '../Routes';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: green[800] // intense green
    },
    secondary: {
      main: red[200] // intense red
    }
  },
  status: {
    danger: 'orange',
  },
});

const Root = (props) => {
  const { store, history } = props;
  return (<Provider store={store}>
      <ThemeProvider theme={theme}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </ThemeProvider>
    </Provider>);
}

export default hot(Root);
