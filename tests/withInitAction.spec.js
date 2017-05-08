import React, { Component } from 'react';
import withInitAction, { clearComponentIds } from '../src/withInitAction';
import { INIT_SELF_ASYNC, INIT_SELF_BLOCKING } from '../src/initSelfMode';

/* eslint-disable react/prefer-stateless-function, react/no-multi-comp */
describe('withInitAction', () => {
  describe('with a non-functional component', () => {
    describe('and no initProps or options', () => {
      clearComponentIds();
      class FooComponent extends Component {
        render() {
          return <noscript />;
        }
      }

      const WithInit = withInitAction(() => Promise.resolve())(FooComponent);
      it('has an initConfig', () => expect(typeof WithInit.initConfig).toBe('object'));
      it('has a string componentId', () => {
        expect(typeof WithInit.initConfig.componentId).toBe('string');
        expect(WithInit.initConfig.componentId).not.toBe('');
      });
      it('has a lazy option of false', () => expect(WithInit.initConfig.options.lazy).toBe(false));
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

    it('should set the options on the initConfig object', () => {
      clearComponentIds();
      class FooComponent extends Component {
        render() {
          return <noscript />;
        }
      }

      const getInitStateDummy = state => state.foo;
      const onErrorDummy = e => e;

      const WithInit = withInitAction(
        () => Promise.resolve(),
        {
          reinitialize: false,
          initSelf: INIT_SELF_BLOCKING,
          lazy: true,
          getInitState: getInitStateDummy,
          onError: onErrorDummy,
        },
      )(FooComponent);

      it('sets the reinitialize option', () => {
        expect(WithInit.initConfig.reinitialize).toBe(false);
      });
      it('sets the initSelf option', () => {
        expect(WithInit.initConfig.initSelf).toBe(INIT_SELF_BLOCKING);
      });
      it('sets the lazy option', () => {
        expect(WithInit.initConfig.lazy).toBe(true);
      });
      it('sets the getInitState option', () => {
        expect(WithInit.initConfig.getInitState).toBe(getInitStateDummy);
      });
      it('sets the onError option', () => {
        expect(WithInit.initConfig.onError).toBe(onErrorDummy);
      });
    });
  });

  describe('with a functional component', () => {
    clearComponentIds();
    const FooComponent = () => <noscript />;

    const WithInit = withInitAction(
      () => Promise.resolve(),
    )(FooComponent);

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
      const WithInit = withInitAction(
        () => Promise.resolve(),
      )(FooComponent);
    }).toThrow();
  });

  it('set the initProps', () => {
    clearComponentIds();
    const FooComponent = () => <noscript />;

    const WithInit = withInitAction(
      ['a', 'b', 'c'],
      () => Promise.resolve(),
    )(FooComponent);
    expect(WithInit.initConfig.initProps).toEqual(['a', 'b', 'c']);
  });

  it('throws an error when two components with the same displayName are passed', () => {
    clearComponentIds();
    class BarComponent extends Component {
      render() {
        return <noscript />;
      }
    }

    class BarComponent2 extends Component {
      static displayName = 'BarComponent';

      render() {
        return <noscript />;
      }
    }

    // eslint-disable-next-line no-unused-vars
    const WithInit = withInitAction(() => Promise.resolve())(BarComponent);
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const WithInit2 = withInitAction(
        () => Promise.resolve(),
      )(BarComponent2);
    }).toThrow();
  });
});
