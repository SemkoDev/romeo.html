import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import { updateRomeo } from './reducers/romeo';
import { getSeason } from './reducers/field';
import { login } from './romeo';

const middleware = [routerMiddleware(history), thunk];

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...middleware)
  // other store enhancers if any
);

const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  enhancer
);
store.dispatch(getSeason());

export default store;
