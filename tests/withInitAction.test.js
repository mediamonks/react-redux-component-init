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
      const TestComponent = withInitAction(mockAction)(SimpleInitTestComponent);

      const environment = new IsomorphicTestEnvironment(() => <TestComponent />, {
        init: initReducer,
      });

      const preparePromise = environment.server.store.dispatch(prepareComponent(TestComponent));

      it('renders the component on the server', async () => {
        await preparePromise;
        const { serverMarkup } = environment.server.render();
        expect(serverMarkup).toMatchSnapshot();
      });

      it('renders the component on the client', () => {
        const { clientTestRenderer } = environment.client.render();
        expect(clientTestRenderer.toJSON()).toMatchSnapshot();
      });

      it('calls the initAction once', () => {
        expect(mockAction).toHaveBeenCalledTimes(1);
      });
    });

    describe('without calling prepareComponent() on the server', () => {
      clearComponentIds();
      const mockAction = () => Promise.resolve();
      const TestComponent = withInitAction({ prepared: mockAction })(SimpleInitTestComponent);

      const environment = new IsomorphicTestEnvironment(() => <TestComponent />, {
        init: initReducer,
      });

      it('throws an error on server', () => {
        expect(() => environment.server.render()).toThrow(PrepareValidationError);
      });
    });
  });

  describe('rendering a component with prepared initAction after first-render on client', () => {
    clearComponentIds();
    const mockAction = jest.fn(() => Promise.resolve());

    const TestComponent = withInitAction(mockAction)(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(() => <div>no TestComponent</div>, {
      init: initReducer,
    });

    environment.server.render();
    const { clientTestRenderer } = environment.client.render();
    environment.client.store.dispatch(setInitMode(MODE_INIT_SELF));
    environment.client.update(() => (
      <div>
        <TestComponent />
      </div>
    ));

    it('renders the component on the client', () => {
      expect(clientTestRenderer.toJSON()).toMatchSnapshot();
    });

    it('calls the initAction once', () => {
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('server-rendering a component with prepared initAction and initProps', () => {
    describe('calling prepareComponent with the correct prop', () => {
      clearComponentIds();
      const mockAction = jest.fn(({ testInitProp }) => Promise.resolve(testInitProp));
      const TestComponent = withInitAction(['testInitProp'], mockAction)(SimpleInitTestComponent);

      const environment = new IsomorphicTestEnvironment(
        () => <TestComponent testInitProp={5} testProp={15} />,
        { init: initReducer },
      );

      const preparePromise = environment.server.store.dispatch(
        prepareComponent(TestComponent, { testInitProp: 5 }),
      );

      it('renders the component on the server', async () => {
        await preparePromise;
        const { serverMarkup } = environment.server.render();
        expect(serverMarkup).toMatchSnapshot();
      });

      it('renders the component on the client', () => {
        const { clientTestRenderer } = environment.client.render();
        expect(clientTestRenderer.toJSON()).toMatchSnapshot();
      });

      it('calls the initAction once with the correct prop value', async () => {
        expect(mockAction).toHaveBeenCalledTimes(1);
        await expect(mockAction.mock.results[0].value).resolves.toBe(5);
      });

      describe('changing a non-init prop on the client', () => {
        it('does not call the initAction again', () => {
          environment.client.store.dispatch(setInitMode(MODE_INIT_SELF));
          environment.client.update(() => <TestComponent testInitProp={5} testProp={16} />);

          return new Promise(resolve => {
            process.nextTick(() => {
              expect(mockAction).toHaveBeenCalledTimes(1);
              resolve();
            });
          });
        });
      });

      describe('changing the init prop on the client', () => {
        it('calls the initAction again with the correct value', () => {
          environment.client.update(() => <TestComponent testInitProp={6} testProp={16} />);

          return new Promise(resolve => {
            process.nextTick(async () => {
              expect(mockAction).toHaveBeenCalledTimes(2);
              await expect(mockAction.mock.results[1].value).resolves.toBe(6);
              resolve();
            });
          });
        });
      });
    });
  });

  describe('server-rendering a component with prepared and clientOnly initAction', () => {
    clearComponentIds();
    const mockActionPrepared = jest.fn(({ testInitProp }) => Promise.resolve(testInitProp));
    const mockActionClient = jest.fn(({ testInitProp }) => Promise.resolve(testInitProp));
    const TestComponent = withInitAction(['testInitProp'], {
      prepared: mockActionPrepared,
      clientOnly: mockActionClient,
    })(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(
      () => <TestComponent testInitProp={5} testProp={15} />,
      { init: initReducer },
    );

    const preparePromise = environment.server.store.dispatch(
      prepareComponent(TestComponent, { testInitProp: 5 }),
    );

    it('renders the component on the server', async () => {
      await preparePromise;
      const { serverMarkup } = environment.server.render();
      expect(serverMarkup).toMatchSnapshot();
    });

    it('calls the prepared initAction once with the correct prop value', async () => {
      expect(mockActionPrepared).toHaveBeenCalledTimes(1);
      await expect(mockActionPrepared.mock.results[0].value).resolves.toBe(5);
    });

    it('does not call the clientOnly initAction before client render', () => {
      expect(mockActionClient).not.toHaveBeenCalled();
    });

    it('renders the component on the client', () => {
      const { clientTestRenderer } = environment.client.render();
      expect(clientTestRenderer.toJSON()).toMatchSnapshot();
    });

    it('calls the prepared initAction only once', () => {
      expect(mockActionPrepared).toHaveBeenCalledTimes(1);
    });

    it('calls the client initAction once with the correct prop value', async () => {
      expect(mockActionClient).toHaveBeenCalledTimes(1);
      await expect(mockActionClient.mock.results[0].value).resolves.toBe(5);
    });

    describe('changing a non-init prop on the client', () => {
      it('does not call the initAction again', () => {
        environment.client.store.dispatch(setInitMode(MODE_INIT_SELF));
        environment.client.update(() => <TestComponent testInitProp={5} testProp={16} />);

        return new Promise(resolve => {
          process.nextTick(() => {
            expect(mockActionClient).toHaveBeenCalledTimes(1);
            expect(mockActionPrepared).toHaveBeenCalledTimes(1);
            resolve();
          });
        });
      });
    });

    describe('changing the init prop on the client', () => {
      it('calls both initAction again with the correct value', () => {
        environment.client.update(() => <TestComponent testInitProp={6} testProp={16} />);

        return new Promise(resolve => {
          process.nextTick(async () => {
            expect(mockActionPrepared).toHaveBeenCalledTimes(2);
            await expect(mockActionPrepared.mock.results[1].value).resolves.toBe(6);
            expect(mockActionClient).toHaveBeenCalledTimes(2);
            await expect(mockActionClient.mock.results[1].value).resolves.toBe(6);
            resolve();
          });
        });
      });
    });
  });

  it('correctly sets isInitializing while rendering async initActions', async () => {
    clearComponentIds();
    const mockActionPrepared = jest.fn(({ testInitProp }) => Promise.resolve(testInitProp));
    const mockActionClient = jest.fn(
      ({ testInitProp }) => new Promise(resolve => setTimeout(() => resolve(testInitProp), 400)),
    );

    const TestComponent = withInitAction(['testInitProp'], {
      prepared: mockActionPrepared,
      clientOnly: mockActionClient,
    })(SimpleInitTestComponent);

    const environment = new IsomorphicTestEnvironment(
      () => <TestComponent testInitProp="unchanged" />,
      { init: initReducer },
    );

    const preparePromise = environment.server.store.dispatch(
      prepareComponent(TestComponent, { testInitProp: 'unchanged' }),
    );
    await preparePromise;
    const { serverMarkup } = environment.server.render();
    expect(serverMarkup).toMatchInlineSnapshot(
      `"<div><h1>This is a test component</h1><span>initializing...</span><span>The test param is: unchanged</span></div>"`,
    );

    // Initial client render
    const { clientTestRenderer } = environment.client.render();
    expect(clientTestRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  <h1>
    This is a test component
  </h1>
  <span>
    initializing...
  </span>
  <span>
    The test param is: 
    unchanged
  </span>
</div>
`);
    environment.client.store.dispatch(setInitMode(MODE_INIT_SELF));

    await new Promise(resolve => process.nextTick(resolve));
    expect(mockActionClient).toHaveBeenCalledTimes(1);
    // After componentDidMount called initComponent
    expect(clientTestRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  <h1>
    This is a test component
  </h1>
  <span>
    initializing...
  </span>
  <span>
    The test param is: 
    unchanged
  </span>
</div>
`);

    await expect(mockActionClient.mock.results[0].value).resolves.toBe('unchanged');
    await new Promise(resolve => process.nextTick(resolve));
    // After initComponent action resolves
    expect(clientTestRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  <h1>
    This is a test component
  </h1>
  <span>
    The test param is: 
    unchanged
  </span>
</div>
`);

    // After prop change
    environment.client.update(() => <TestComponent testInitProp="changed" />);
    expect(clientTestRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  <h1>
    This is a test component
  </h1>
  <span>
    initializing...
  </span>
  <span>
    The test param is: 
    changed
  </span>
</div>
`);

    await new Promise(resolve => process.nextTick(resolve));
    expect(mockActionClient).toHaveBeenCalledTimes(2);
    await expect(mockActionClient.mock.results[1].value).resolves.toBe('changed');
    await new Promise(resolve => process.nextTick(resolve));

    // After reinitialize completes
    expect(clientTestRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  <h1>
    This is a test component
  </h1>
  <span>
    The test param is: 
    changed
  </span>
</div>
`);
  });
});
