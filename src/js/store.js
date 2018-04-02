import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {routerMiddleware, routerReducer} from "react-router-redux";
import reducers from "./reducers";
import { updateRomeo } from "./reducers/romeo";
import { login } from "./romeo";


const middleware = [
  routerMiddleware(history)
];

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

// Add the reducer to your store on the `router` key
// Also apply our middleware for navigating
const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  }),
  enhancer
);

// Now you can dispatch navigation actions from anywhere!
// store.dispatch(push('/foo'))

login('Maximilian', 'Mustermann999!', (romeo) => store.dispatch(updateRomeo(romeo)));

export default store;
