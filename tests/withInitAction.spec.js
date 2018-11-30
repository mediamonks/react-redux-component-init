/* global expect, describe, it, jest */
import React, { Component } from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';

import withInitAction, { clearComponentIds } from '../src/withInitAction';
import { INIT_SELF_ASYNC, INIT_SELF_BLOCKING } from '../src/initSelfMode';

import SimpleInitTestComponent from './fixtures/SimpleInitTestComponent';
import {
  modeInitSelfAndSimplePreparedNoProps,
  modeInitSelfAndSimplePreparedReinitializedNoProps,
  modeInitSelfAndSimplePreparedReinitializingNoProps,
  modePrepareAndSimplePreparedNoProps
} from './fixtures/storeState';

const mockStore = configureMockStore([thunk]);

/* eslint-disable react/prefer-stateless-function, react/no-multi-comp */
describe('withInitAction', () => {
  describe('with a class component', () => {
    describe('and no initProps or options', () => {
      clearComponentIds();
      class FooComponent extends Component {
        render() {
          return <noscript />;
        }
      }

      const testAction = () => Promise.resolve();
      const WithInit = withInitAction(testAction)(FooComponent);
      it('has an initConfig', () => expect(typeof WithInit.initConfig).toBe('object'));
      it('sets the initAction on the config object', () =>
        expect(WithInit.initConfig.initAction).toBe(testAction));
      it('has initActionClient of null', () =>
        expect(WithInit.initConfig.initActionClient).toBe(null));
      it('has a string componentId', () => {
        expect(typeof WithInit.initConfig.componentId).toBe('string');
        expect(WithInit.initConfig.componentId).not.toBe('');
      });
      it('has an allowLazy option of false', () =>
        expect(WithInit.initConfig.options.allowLazy).toBe(false));
      it('has an empty array for initProps', () => {
        expect(WithInit.initConfig.initProps).toEqual([]);
      });
      it('has a initSelf option of INIT_SELF_ASYNC', () => {
        expect(WithInit.initConfig.options.initSelf).toBe(INIT_SELF_ASYNC);
      });
      it('has a reinitialize option of true', () => {
        expect(WithInit.initConfig.options.reinitialize).toBe(true);
      });
    });

    describe('with all options set', () => {
      clearComponentIds();
      class FooComponent extends Component {
        render() {
          return <noscript />;
        }
      }

      const getInitStateDummy = state => state.foo;
      const onErrorDummy = e => e;

      const WithInit = withInitAction(() => Promise.resolve(), {
        reinitialize: false,
        initSelf: INIT_SELF_BLOCKING,
        allowLazy: true,
        getInitState: getInitStateDummy,
        onError: onErrorDummy,
      })(FooComponent);

      it('sets the reinitialize option', () => {
        expect(WithInit.initConfig.options.reinitialize).toBe(false);
      });
      it('sets the initSelf option', () => {
        expect(WithInit.initConfig.options.initSelf).toBe(INIT_SELF_BLOCKING);
      });
      it('sets the allowLazy option', () => {
        expect(WithInit.initConfig.options.allowLazy).toBe(true);
      });
      it('sets the getInitState option', () => {
        expect(WithInit.initConfig.options.getInitState).toBe(getInitStateDummy);
      });
      it('sets the onError option', () => {
        expect(WithInit.initConfig.options.onError).toBe(onErrorDummy);
      });
    });
  });

  describe('with a { prepared: action } set', () => {
    describe('and no initProps or options', () => {
      clearComponentIds();
      const testAction = () => Promise.resolve();
      const WithInit = withInitAction({ prepared: testAction })(SimpleInitTestComponent);

      it('has initActionClient of null', () =>
        expect(WithInit.initConfig.initActionClient).toBe(null));
      it('sets the initAction on the config object', () =>
        expect(WithInit.initConfig.initAction).toBe(testAction));
      it('has a reinitialize option of true', () => {
        expect(WithInit.initConfig.options.reinitialize).toBe(true);
      });
      it('has an empty array for initProps', () => {
        expect(WithInit.initConfig.initProps).toEqual([]);
      });
    });

    describe('with initProps but no options', () => {
      clearComponentIds();
      const testAction = () => Promise.resolve();
      const WithInit = withInitAction(['testInitProp'], { prepared: testAction })(
        SimpleInitTestComponent,
      );

      it('has initActionClient of null', () =>
        expect(WithInit.initConfig.initActionClient).toBe(null));
      it('sets the initAction on the config object', () =>
        expect(WithInit.initConfig.initAction).toBe(testAction));
      it('has a initSelf option of INIT_SELF_ASYNC', () => {
        expect(WithInit.initConfig.options.initSelf).toBe(INIT_SELF_ASYNC);
      });
      it('sets the initProps config', () => {
        expect(WithInit.initConfig.initProps).toEqual(['testInitProp']);
      });
    });

    describe('with initProps and { allowLazy: true }', () => {
      clearComponentIds();
      const testAction = () => Promise.resolve();
      const WithInit = withInitAction(
        ['testInitProp'],
        { prepared: testAction },
        { allowLazy: true },
      )(SimpleInitTestComponent);

      it('has initActionClient of null', () =>
        expect(WithInit.initConfig.initActionClient).toBe(null));
      it('sets the initAction on the config object', () =>
        expect(WithInit.initConfig.initAction).toBe(testAction));
      it('sets the allowLazy option', () => {
        expect(WithInit.initConfig.options.allowLazy).toBe(true);
      });
      it('sets the initProps config', () => {
        expect(WithInit.initConfig.initProps).toEqual(['testInitProp']);
      });
    });
  });

  describe('with a prepared and clientOnly action, initProps and options', () => {
    clearComponentIds();
    const testActionPrepared = () => Promise.resolve();
    const testActionClientOnly = () => Promise.resolve();
    const WithInit = withInitAction(
      ['testInitProp'],
      { prepared: testActionPrepared, clientOnly: testActionClientOnly },
      { allowLazy: true },
    )(SimpleInitTestComponent);

    it('sets the initAction on the config object', () =>
      expect(WithInit.initConfig.initAction).toBe(testActionPrepared));
    it('sets the initActionClient on the config object', () =>
      expect(WithInit.initConfig.initActionClient).toBe(testActionClientOnly));
    it('sets the options', () => {
      expect(WithInit.initConfig.options.allowLazy).toBe(true);
    });
    it('sets the initProps config', () => {
      expect(WithInit.initConfig.initProps).toEqual(['testInitProp']);
    });
  });

  describe('with just a clientOnly action', () => {
    clearComponentIds();
    const testActionClientOnly = () => Promise.resolve();
    const WithInit = withInitAction(['testInitProp'], { clientOnly: testActionClientOnly })(
      SimpleInitTestComponent,
    );

    it('has initAction of null', () => expect(WithInit.initConfig.initAction).toBe(null));
    it('sets the initActionClient on the config object', () =>
      expect(WithInit.initConfig.initActionClient).toBe(testActionClientOnly));
  });

  describe('with a component that has been prepared and no initSelf state and initMode === MODE_PREPARE', () => {
    // see issue #17
    it('does not set an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore(modePrepareAndSimplePreparedNoProps);

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer
        .create(
          <Provider store={store}>
            <WithInit />
          </Provider>,
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a component with no initSelf state and initMode === MODE_INIT_SELF', () => {
    // See issue #19
    it('sets an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore(modeInitSelfAndSimplePreparedNoProps);

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer
        .create(
          <Provider store={store}>
            <WithInit />
          </Provider>,
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a component that has been prepared and is re-initializing', () => {
    it('sets an { isInitializing: true } prop', () => {
      clearComponentIds();

      const store = mockStore(modeInitSelfAndSimplePreparedReinitializingNoProps);

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer
        .create(
          <Provider store={store}>
            <WithInit />
          </Provider>,
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a component that has been prepared and has completed re-initializing', () => {
    it('does not set an { isInitializing: true } prop', () => {
      clearComponentIds();
      const store = mockStore(modeInitSelfAndSimplePreparedReinitializedNoProps);

      const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);
      const tree = renderer
        .create(
          <Provider store={store}>
            <WithInit />
          </Provider>,
        )
        .toJSON();

      expect(tree).toMatchSnapshot();
    });
  });

  describe('with a functional component', () => {
    clearComponentIds();

    const WithInit = withInitAction(() => Promise.resolve())(SimpleInitTestComponent);

    it('has a string componentId', () => {
      expect(typeof WithInit.initConfig.componentId).toBe('string');
      expect(WithInit.initConfig.componentId).not.toBe('');
    });
  });

  it('throws an error for components without a name or displayName', () => {
    clearComponentIds();
    const FooComponent = () => <noscript />;
    delete FooComponent.name;

    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const WithInit = withInitAction(() => Promise.resolve())(FooComponent);
    }).toThrow();
  });

  it('set the initProps', () => {
    clearComponentIds();

    const WithInit = withInitAction(['a', 'b', 'c'], () => Promise.resolve())(
      SimpleInitTestComponent,
    );
    expect(WithInit.initConfig.initProps).toEqual(['a', 'b', 'c']);
  });
});
