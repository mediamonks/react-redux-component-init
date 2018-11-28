/* global expect, describe, it, jest */
import React from 'react';

import withInitAction, { clearComponentIds } from '../src/withInitAction';
import initReducer from '../src/reducer';
import prepareComponent from '../src/actions/prepareComponent';
import PrepareValidationError from '../src/PrepareValidationError';
import setInitMode from '../src/actions/setInitMode';
import { MODE_INIT_SELF } from '../src/initMode';

import SimpleInitTestComponent from './fixtures/SimpleInitTestComponent';
import IsomorphicTestEnvironment from './IsomorphicTestEnvironment';

describe('isomorphic application', () => {
  describe('server-rendering a component with prepared initAction', () => {
    describe('and calling prepareComponent() on the server', () => {
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

    describe('without calling prepareComponent() on the server', () => {
      clearComponentIds();
      const mockAction = () => Promise.resolve();
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

  describe('rendering a component with prepared initAction after first-render on client', () => {
    clearComponentIds();
    const mockAction = jest.fn(() => Promise.resolve());

    const TestComponent = withInitAction(
      mockAction,
    )(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(
      () => <div>no TestComponent</div>,
      { init: initReducer },
    );

    environment.server.render();
    const { clientTestRenderer } = environment.client.render();
    environment.client.store.dispatch(setInitMode(MODE_INIT_SELF));
    environment.client.update(() => <div><TestComponent /></div>);

    it('should render the component on the client', () => {
      expect(clientTestRenderer.toJSON()).toMatchSnapshot();
    });

    it('should call the initAction once', () => {
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });
});
