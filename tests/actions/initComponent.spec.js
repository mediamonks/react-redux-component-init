import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import initComponent from '../../src/actions/initComponent';
import withInitAction, { clearComponentIds } from '../../src/withInitAction';
import { MODE_INIT_SELF, MODE_PREPARE } from '../../src/initMode';
import { INIT_COMPONENT } from '../../src/actions/actionTypes';

const mockStore = configureMockStore([thunk]);

describe('initComponent', () => {
  describe('when initMode === MODE_PREPARE', () => {
    describe('with no isPrepare option given', () => {
      describe('and no prepare state is present', () => {
        clearComponentIds();
        const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(() => Promise.resolve())(MockComponent);

        it('throws an error', () => {
          expect(() => store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]'))).toThrow();
        });
      });
      describe('and the preparation in state is still pending', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_PREPARE,
          prepared: {
            'MockComponent[]': false,
          },
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(() => Promise.resolve())(MockComponent);

        it('throws an error', () => {
          expect(() => store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]'))).toThrow();
        });
      });
      describe('and the preparation is done with different props', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_PREPARE,
          prepared: {
            'MockComponent["foo"]': true,
          },
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(['p1'], () => Promise.resolve())(MockComponent);

        it('throws an error', () => {
          expect(
            () => store.dispatch(initComponent(MockWithInit, ['bar'], 'MockComponent["bar"]')),
          ).toThrow();
        });
      });
    });
    describe('with {isPrepare: true}', () => {
      describe('and no prepare state is present', () => {
        it('dispatches INIT_COMPONENT with { completed: false }', () => {
          clearComponentIds();
          const store = mockStore({ init: {
            mode: MODE_PREPARE,
            prepared: {},
          } });
          const MockComponent = () => <noscript />;
          const MockWithInit = withInitAction(
            () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
          )(MockComponent);
          store.dispatch(initComponent(
            MockWithInit,
            [],
            'MockComponent[]',
            { isPrepare: true },
          ));

          const actions = store.getActions();
          expect(actions).toEqual([
            {
              type: INIT_COMPONENT,
              payload: { complete: false, isPrepare: true, prepareKey: 'MockComponent[]' },
            },
          ]);
        });

        it('calls the initAction and dispatches { completed: true } when the action resolves', () => {
          clearComponentIds();
          const store = mockStore({ init: {
            mode: MODE_PREPARE,
            prepared: {},
          } });
          const MockComponent = () => <noscript />;
          const mockInitAction = jest.fn(
            () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
          );
          const MockWithInit = withInitAction(mockInitAction)(MockComponent);
          const initPromise = store.dispatch(initComponent(
            MockWithInit,
            [],
            'MockComponent[]',
            { isPrepare: true },
          ));

          return initPromise.then(() => {
            const actions = store.getActions();
            expect(actions).toEqual([
              {
                type: INIT_COMPONENT,
                payload: { complete: false, isPrepare: true, prepareKey: 'MockComponent[]' },
              },
              {
                type: INIT_COMPONENT,
                payload: { complete: true, isPrepare: true, prepareKey: 'MockComponent[]' },
              },
            ]);

            expect(mockInitAction.mock.calls.length).toBe(1);
          });
        });
      });
      describe('with an initAction that rejects', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_PREPARE,
          prepared: {},
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(
          () => new Promise((resolve, reject) => setTimeout(() => reject('bar'), 40)),
        )(MockComponent);
        const initPromise = store.dispatch(initComponent(
          MockWithInit,
          [],
          'MockComponent[]',
          { isPrepare: true },
        ));

        it('rejects the return promise', () => expect(initPromise).rejects.toBe('bar'));
      });
      describe('with an initAction that rejects and an error handler', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_PREPARE,
          prepared: {},
        } });
        const MockComponent = () => <noscript />;
        const mockErrorHandler = jest.fn();
        const MockWithInit = withInitAction(
          () => new Promise((resolve, reject) => setTimeout(() => reject('bar'), 40)),
          { onError: mockErrorHandler },
        )(MockComponent);
        const initPromise = store.dispatch(initComponent(
          MockWithInit,
          [],
          'MockComponent[]',
          { isPrepare: true },
        ));

        it('resolves the returned promise', () => expect(initPromise).resolves.toBeUndefined());
        it(
          'calls the error handler with the rejected value',
          () => expect(mockErrorHandler).toBeCalledWith('bar'),
        );
      });
      describe('and prepare is already in progress', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_PREPARE,
          prepared: {
            'MockComponent[]': false,
          },
        } });
        const MockComponent = () => <noscript />;
        const mockInitAction = jest.fn(
          () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
        );
        const MockWithInit = withInitAction(
          [],
          mockInitAction,
        )(MockComponent);
        const initPromise = store.dispatch(initComponent(
          MockWithInit,
          [],
          'MockComponent[]',
          { isPrepare: true },
        ));

        it('does not call the initAction', () => initPromise.then(
          () => expect(mockInitAction.mock.calls.length).toBe(0)),
        );

        it('does not dispatch INIT_COMPONENT', () => initPromise.then(() => {
          const actions = store.getActions();
          expect(actions).toEqual([]);
        }));
      });
    });
  });
  describe('when initMode === MODE_INIT_SELF', () => {
    describe('with an async initAction', () => {
      it('dispatches INIT_COMPONENT with { completed: false }', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_INIT_SELF,
          prepared: {},
          selfInit: {},
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(
          () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
        )(MockComponent);
        store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]'));

        const actions = store.getActions();
        expect(actions).toEqual([
          {
            type: INIT_COMPONENT,
            payload: { complete: false, isPrepare: false, prepareKey: 'MockComponent[]' },
          },
        ]);
      });

      it('dispatches { completed: true } when the action resolves', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_INIT_SELF,
          prepared: {},
          selfInit: {},
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(
          () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
        )(MockComponent);
        const initPromise = store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]'));

        return initPromise.then(() => {
          const actions = store.getActions();
          expect(actions).toEqual([
            {
              type: INIT_COMPONENT,
              payload: { complete: false, isPrepare: false, prepareKey: 'MockComponent[]' },
            },
            {
              type: INIT_COMPONENT,
              payload: { complete: true, isPrepare: false, prepareKey: 'MockComponent[]' },
            },
          ]);
        });
      });

      it('dispatches { completed: true } when the action resolves', () => {
        clearComponentIds();
        const store = mockStore({ init: {
          mode: MODE_INIT_SELF,
          prepared: {},
          selfInit: {},
        } });
        const MockComponent = () => <noscript />;
        const MockWithInit = withInitAction(
          () => new Promise(resolve => setTimeout(() => resolve('bar'), 40)),
        )(MockComponent);
        const initPromise = store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]'));

        return initPromise.then(result => expect(result).toBe('bar'));
      });
    });
  });
  describe('on a component with custom getInitState', () => {
    clearComponentIds();
    const store = mockStore({ foo: { mode: MODE_PREPARE, prepared: { 'MockComponent[]': true } } });
    const MockComponent = () => <noscript />;
    const MockWithInit = withInitAction(() => Promise.resolve(), {
      getInitState: state => state.foo,
    })(MockComponent);

    it('runs without error', () => {
      expect(
        () => store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]')),
      ).not.toThrow();
    });
  });
  describe('with an initAction that does not return a Promise', () => {
    clearComponentIds();
    const store = mockStore({ init: { mode: MODE_INIT_SELF, prepared: {} } });
    const MockComponent = () => <noscript />;
    const MockWithInit = withInitAction(
      () => 5,
    )(MockComponent);

    it('rejects the returned promise', () => {
      expect(
        store.dispatch(initComponent(MockWithInit, [], 'MockComponent[]')),
      ).rejects.toBeDefined();
    });
  });
});
