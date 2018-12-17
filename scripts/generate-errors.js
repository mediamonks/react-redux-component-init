import React from 'react';

import withInitAction, { clearComponentIds } from '../src/withInitAction';
import SimpleInitTestComponent from '../tests/fixtures/SimpleInitTestComponent';
import IsomorphicTestEnvironment from '../tests/IsomorphicTestEnvironment';
import initReducer from '../src/reducer';
import prepareComponent from '../src/actions/prepareComponent';

function errorPrepareExpectedProp() {
  clearComponentIds();
  const TestComponent = withInitAction(
    ['foo', 'bar', 'foobar'],
    () => Promise.resolve()
  )(SimpleInitTestComponent);

  const environment = new IsomorphicTestEnvironment(() => <TestComponent />, {
    init: initReducer,
  });

  try {
    environment.server.store.dispatch(prepareComponent(TestComponent, { foo: 1 }));
  } catch (e) {
    console.log(e.message);
    console.log('\n');
  }
}

function errorPrepareNotCalled() {
  clearComponentIds();
  const TestComponent = withInitAction(
    () => Promise.resolve()
  )(SimpleInitTestComponent);

  const environment = new IsomorphicTestEnvironment(() => <TestComponent />, {
    init: initReducer,
  });

  try {
    environment.server.render();
  } catch (e) {
    console.log(e.message);
    console.log('\n');
  }
}

async function errorPrepareNotCalledWithProps() {
  clearComponentIds();
  const TestComponent = withInitAction(
    ['foo', 'bar'],
    () => Promise.resolve()
  )(SimpleInitTestComponent);

  const environment = new IsomorphicTestEnvironment(() => <TestComponent foo={5} bar={6} />, {
    init: initReducer,
  });
  await environment.server.store.dispatch(prepareComponent(TestComponent, { foo: 1, bar: 2 }));

  try {
    environment.server.render();
  } catch (e) {
    console.log(e.message);
    console.log('\n');
  }
}

function errorPreparePending() {
  clearComponentIds();
  const TestComponent = withInitAction(
    () => new Promise(resolve => setTimeout(resolve, 1000))
  )(SimpleInitTestComponent);

  const environment = new IsomorphicTestEnvironment(() => <TestComponent />, {
    init: initReducer,
  });
  environment.server.store.dispatch(prepareComponent(TestComponent));

  try {
    environment.server.render();
  } catch (e) {
    console.log(e.message);
    console.log('\n');
  }
}

function errorPreparePendingWithProps() {
  clearComponentIds();
  const TestComponent = withInitAction(
    ['foo', 'bar'],
    () => new Promise(resolve => setTimeout(resolve, 1000))
  )(SimpleInitTestComponent);

  const environment = new IsomorphicTestEnvironment(() => <TestComponent foo={1} bar={2} />, {
    init: initReducer,
  });
  environment.server.store.dispatch(prepareComponent(TestComponent, { foo: 1, bar: 2 }));

  try {
    environment.server.render();
  } catch (e) {
    console.log(e.message);
    console.log('\n');
  }
}

(async function main() {
  errorPrepareExpectedProp();
  errorPrepareNotCalled();
  await errorPrepareNotCalledWithProps();
  errorPreparePending();
  errorPreparePendingWithProps();
})();

