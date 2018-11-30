/* global expect, describe, it, jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import initComponent from '../../src/actions/initComponent';
import withInitAction, { clearComponentIds } from '../../src/withInitAction';
import { MODE_INIT_SELF, MODE_PREPARE } from '../../src/initMode';
import SimpleInitTestComponent from '../fixtures/SimpleInitTestComponent';

const mockStore = configureMockStore([thunk]);

describe('initComponent with clientOnly action', () => {
  describe('when initMode === MODE_PREPARE', () => {
    describe("with { caller: 'willMount' } option given", () => {
      clearComponentIds();
      const testAction = jest.fn(() => Promise.resolve());
      const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
      const MockWithInit = withInitAction({ clientOnly: testAction })(SimpleInitTestComponent);

      store.dispatch(
        initComponent(MockWithInit, [], 'SimpleInitTestComponent[]', { caller: 'willMount' }),
      );

      it('does not call the action', () =>
        new Promise(resolve => {
          process.nextTick(() => {
            expect(testAction).not.toHaveBeenCalled();
            resolve();
          });
        }));

      it('does not dispatch INIT_COMPONENT', () => {
        const actions = store.getActions();
        return expect(actions).toEqual([]);
      });
    });
    describe("with { caller: 'didMount' } option given", () => {
      clearComponentIds();
      const testAction = jest.fn(() => Promise.resolve());
      const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
      const MockWithInit = withInitAction({ clientOnly: testAction })(SimpleInitTestComponent);

      store.dispatch(
        initComponent(MockWithInit, [], 'SimpleInitTestComponent[]', { caller: 'didMount' }),
      );

      it('does not call the action', () =>
        new Promise(resolve => {
          process.nextTick(() => {
            expect(testAction).not.toHaveBeenCalled();
            resolve();
          });
        }));

      it('does not dispatch INIT_COMPONENT', () => {
        const actions = store.getActions();
        return expect(actions).toEqual([]);
      });
    });
  });

  describe('when initMode === MODE_INIT_SELF', () => {
    describe("with { caller: 'willMount' } option given", () => {
      clearComponentIds();
      const testAction = jest.fn(() => Promise.resolve());
      const store = mockStore({ init: { mode: MODE_INIT_SELF, prepared: {} } });
      const MockWithInit = withInitAction({ clientOnly: testAction })(SimpleInitTestComponent);

      store.dispatch(
        initComponent(MockWithInit, [], 'SimpleInitTestComponent[]', { caller: 'willMount' }),
      );

      it('does not call the action', () =>
        new Promise(resolve => {
          process.nextTick(() => {
            expect(testAction).not.toHaveBeenCalled();
            resolve();
          });
        }));

      it('does not dispatch INIT_COMPONENT', () => {
        const actions = store.getActions();
        return expect(actions).toEqual([]);
      });
    });

    describe("with { caller: 'didMount' } option given and init props", () => {
      it('calls the action with the correct values', () => {
        clearComponentIds();
        const mockAction = jest.fn(({ testInitProp }) => Promise.resolve(testInitProp));
        const store = mockStore({ init: { mode: MODE_INIT_SELF, prepared: {} } });
        const MockWithInit = withInitAction(['testInitProp'], { clientOnly: mockAction })(
          SimpleInitTestComponent,
        );

        store.dispatch(
          initComponent(MockWithInit, [45], 'SimpleInitTestComponent[45]', { caller: 'didMount' }),
        );

        return new Promise(resolve => {
          process.nextTick(() => {
            expect(mockAction).toHaveBeenCalledTimes(1);
            expect(mockAction.mock.results[0].value)
              .resolves.toBe(45)
              .then(resolve);
          });
        });
      });

      it('initially dispatches INIT_COMPONENT with { complete: false }', () => {
        clearComponentIds();
        const mockAction = jest.fn(
          ({ testInitProp }) => new Promise(resolve => setTimeout(() => resolve(testInitProp), 40)),
        );
        const store = mockStore({ init: { mode: MODE_INIT_SELF, prepared: {} } });
        const MockWithInit = withInitAction(['testInitProp'], { clientOnly: mockAction })(
          SimpleInitTestComponent,
        );

        store.dispatch(
          initComponent(MockWithInit, [45], 'SimpleInitTestComponent[45]', { caller: 'didMount' }),
        );

        return new Promise(resolve => {
          process.nextTick(() => {
            const actions = store.getActions();
            expect(actions).toMatchSnapshot();

            resolve();
          });
        });
      });

      it('dispatches INIT_COMPONENT with { complete: true } when the action resolves', () => {
        clearComponentIds();
        const mockAction = jest.fn(
          ({ testInitProp }) => new Promise(resolve => setTimeout(() => resolve(testInitProp), 40)),
        );
        const store = mockStore({ init: { mode: MODE_INIT_SELF, prepared: {} } });
        const MockWithInit = withInitAction(['testInitProp'], { clientOnly: mockAction })(
          SimpleInitTestComponent,
        );

        store.dispatch(
          initComponent(MockWithInit, [45], 'SimpleInitTestComponent[45]', { caller: 'didMount' }),
        );

        return new Promise(resolve => {
          process.nextTick(() => {
            mockAction.mock.results[0].value.then(() => {
              process.nextTick(() => {
                const actions = store.getActions();
                expect(actions).toMatchSnapshot();
                resolve();
              });
            });
          });
        });
      });
    });
  });
});
