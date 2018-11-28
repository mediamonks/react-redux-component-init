/* global expect, describe, it, jest */
import React from 'react';

import withInitAction, { clearComponentIds } from '../src/withInitAction';
import initReducer from '../src/reducer';
import prepareComponent from '../src/actions/prepareComponent';
import PrepareValidationError from '../src/PrepareValidationError';

import SimpleInitTestComponent from './fixtures/SimpleInitTestComponent';
import IsomorphicTestEnvironment from './IsomorphicTestEnvironment';

describe('isomorphic application', () => {
  describe('rendering a component with initAction function and calling prepareComponent', () => {
    clearComponentIds();
    const mockAction = jest.fn(() => Promise.resolve());
    const TestComponent = withInitAction(
      mockAction,
    )(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(
      () => <TestComponent />,
      { init: initReducer },
    );

    const preparePromise = environment.server.store.dispatch(prepareComponent(TestComponent));

    it('should render the component on the server', async () => {
      await preparePromise;
      const { serverTestRenderer } = environment.server.render();
      expect(serverTestRenderer.toJSON()).toMatchSnapshot();
    });

    it('should render the component on the client', () => {
      const { clientTestRenderer } = environment.client.render();
      expect(clientTestRenderer.toJSON()).toMatchSnapshot();
    });

    it('should call the initAction once', () => {
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('rendering a component with initAction function without calling prepareComponent', () => {
    clearComponentIds();
    const mockAction = jest.fn(() => Promise.resolve());
    const TestComponent = withInitAction(
      mockAction,
    )(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(
      () => <TestComponent />,
      { init: initReducer },
    );

    it('should throw an error on server', () => {
      expect(() => environment.server.render()).toThrow(PrepareValidationError);
    });
  });
});
