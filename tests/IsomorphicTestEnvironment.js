import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import renderer from 'react-test-renderer';
import thunk from 'redux-thunk';

export default function IsomorphicTestEnvironment(componentFunc, reducers) {
  const self = this;
  const rootReducer = combineReducers(reducers);
  let serverStoreState = null;

  this.server = { store: createStore(rootReducer, applyMiddleware(thunk)) };
  this.client = { store: null };

  this.server.render = function () {
    if (serverStoreState) {
      throw new Error('Store state already set. Did you call IsomorphicTestRenderer.server.render() twice?');
    }

    const rootElement = (
      <Provider store={self.server.store}>
        { componentFunc() }
      </Provider>
    );
    const serverTestRenderer = renderer.create(rootElement);
    serverStoreState = self.server.store.getState();

    return { serverTestRenderer };
  };

  this.client.render = function () {
    if (!serverStoreState) {
      throw new Error('No store state from server set. Call IsomorphicTestRenderer.server.render() before running IsomorphicTestRenderer.client.render()');
    }
    if (self.client.store) {
      throw new Error('Client store already exists. Did you call IsomorphicTestRenderer.client.render() twice?');
    }

    self.client.store = createStore(rootReducer, serverStoreState, applyMiddleware(thunk));
    const rootElement = (
      <Provider store={self.client.store}>
        { componentFunc() }
      </Provider>
    );
    const clientTestRenderer = renderer.create(rootElement);

    return { clientTestRenderer, state: self.client.store.getState() };
  };
}
