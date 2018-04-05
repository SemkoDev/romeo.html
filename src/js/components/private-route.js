import React from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router';
import { Redirect } from 'react-router-dom';

class PrivateRouteContainer extends React.Component {
  render() {
    const { isAuthenticated, component: Component, ...props } = this.props;

    return (
      <Route
        {...props}
        render={props =>
          isAuthenticated ? (
            <Component {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          )
        }
      />
    );
  }
}

const PrivateRoute = connect(state => ({
  isAuthenticated: state.romeo && state.romeo.keys
}))(PrivateRouteContainer);

export default PrivateRoute;
