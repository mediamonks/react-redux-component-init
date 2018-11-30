/* global expect, describe, it, jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { connect } from 'react-redux';

import withInitAction, { clearComponentIds } from '../../src/withInitAction';
import prepareComponent from '../../src/actions/prepareComponent';
import { MODE_PREPARE } from '../../src/initMode';
import SimpleInitTestComponent from '../fixtures/SimpleInitTestComponent';

const mockStore = configureMockStore([thunk]);

describe('prepareComponent', () => {
  describe('with a component without initConfig', () => {
    it('should return a promise that resolves', () => {
      const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
      return expect(
        store.dispatch(prepareComponent(SimpleInitTestComponent, {})),
      ).resolves.toBeUndefined();
    });
  });
  describe('with a custom getInitState', () => {
    clearComponentIds();
    const store = mockStore({ custom: { mode: MODE_PREPARE, prepared: {} } });
    const MockWithInit = withInitAction(() => Promise.resolve(), {
      getInitState: state => state.custom,
    })(SimpleInitTestComponent);
    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('should dispatch INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
  });
  describe('with a custom getPrepareKey', () => {
    clearComponentIds();
    const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
    const MockWithInit = withInitAction(() => Promise.resolve(), {
      getPrepareKey: componentId => `${componentId}!foobar`,
    })(SimpleInitTestComponent);
    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('should dispatch INIT_COMPONENT actions with the correct prepareKey', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
  });
  describe('with a component configured with allowLazy', () => {
    clearComponentIds();
    const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
    const mockInitAction = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(mockInitAction, {
      allowLazy: true,
    })(SimpleInitTestComponent);

    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('should call the initAction', () =>
      preparePromise.then(() => expect(mockInitAction.mock.calls.length).toBe(1)));
    it('should dispatch INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
  });
  describe('with a component wrapped in connect()', () => {
    clearComponentIds();
    const store = mockStore({ custom: { mode: MODE_PREPARE, prepared: {} } });
    const mockInitAction = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(mockInitAction, {
      getInitState: state => state.custom,
    })(SimpleInitTestComponent);
    const ConnectedMockWithInit = connect(
      null,
      null,
    )(MockWithInit);
    const preparePromise = store.dispatch(prepareComponent(ConnectedMockWithInit, {}));

    it('should dispatch INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
    it('should call the initAction', () =>
      preparePromise.then(expect(mockInitAction.mock.calls.length).toBe(1)));
  });
  describe('with props', () => {
    clearComponentIds();
    const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
    const mockInitAction = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(['foo', 'bar'], mockInitAction)(SimpleInitTestComponent);
    const preparePromise = store.dispatch(
      prepareComponent(MockWithInit, {
        bar: 'abc',
        foo: 123,
        foobar: 3,
      }),
    );

    it('should only include values of initProps in the prepareKey', () =>
      preparePromise.then(() =>
        expect(store.getActions()[0].payload.prepareKey).toBe('SimpleInitTestComponent[123,"abc"]'),
      ));

    it('should call the initAction with only the initProps values', () =>
      preparePromise.then(() =>
        expect(mockInitAction.mock.calls[0][0]).toEqual({
          bar: 'abc',
          foo: 123,
        }),
      ));
  });
  describe('when not passing one of the values configured in initProps', () => {
    clearComponentIds();
    const store = mockStore({ init: { mode: MODE_PREPARE, prepared: {} } });
    const MockWithInit = withInitAction(['foo', 'bar'], () => Promise.resolve())(
      SimpleInitTestComponent,
    );

    it('should throw an error', () =>
      expect(() =>
        store.dispatch(
          prepareComponent(MockWithInit, {
            bar: 'abc',
          }),
        ),
      ).toThrow());
  });
});
