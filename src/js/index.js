import 'babel-polyfill'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import createHistory from 'history/createHashHistory'
import { Route, Switch } from 'react-router'
import { Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'

import 'semantic-ui-css/semantic.min.css'

import store from './store'
import PrivateRoute from './components/private-route'
import Home, { HomeRedirect } from './views/home'
import Login from './views/login'

import classes from '../css/main.css'


ReactDOM.render(
  <Provider store={store}>
    { /* ConnectedRouter will use the store from Provider automatically */ }
    <ConnectedRouter history={createHistory()}>
      <Switch>
        <Route exact path="/login" component={Login}/>
        <PrivateRoute component={Home}/>
      </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);