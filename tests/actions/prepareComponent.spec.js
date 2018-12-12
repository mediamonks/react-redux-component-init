/* global expect, describe, it, jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { connect } from 'react-redux';

import withInitAction, { clearComponentIds } from '../../src/withInitAction';
import prepareComponent from '../../src/actions/prepareComponent';
import { MODE_PREPARE } from '../../src/initMode';
import SimpleInitTestComponent from '../fixtures/SimpleInitTestComponent';
import { modePrepareAndNothingPrepared } from '../fixtures/storeState';

const mockStore = configureMockStore([thunk]);

describe('prepareComponent', () => {
  describe('with a component without initConfig', () => {
    it('returns a promise that resolves', () => {
      const store = mockStore(modePrepareAndNothingPrepared);
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
    it('dispatches INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
  });
  describe('with a custom getPrepareKey', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const MockWithInit = withInitAction(() => Promise.resolve(), {
      getPrepareKey: componentId => `${componentId}!foobar`,
    })(SimpleInitTestComponent);
    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('dispatches INIT_COMPONENT actions with the correct prepareKey', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
  });
  describe('with a component configured with allowLazy', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitAction = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(mockInitAction, {
      allowLazy: true,
    })(SimpleInitTestComponent);

    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('calls the initAction', () =>
      preparePromise.then(() => expect(mockInitAction).toHaveBeenCalledTimes(1)));
    it('dispatches INIT_COMPONENT actions', () =>
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

    it('dispatches INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));
    it('calls the initAction', () =>
      preparePromise.then(expect(mockInitAction).toHaveBeenCalledTimes(1)));
  });
  describe('with props', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitAction = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(['foo', 'bar'], mockInitAction)(SimpleInitTestComponent);
    const preparePromise = store.dispatch(
      prepareComponent(MockWithInit, {
        bar: 'abc',
        foo: 123,
        foobar: 3,
      }),
    );

    it('only includes values of initProps in the prepareKey', () =>
      preparePromise.then(() =>
        expect(store.getActions()[0].payload.prepareKey).toBe('SimpleInitTestComponent[123,"abc"]'),
      ));

    it('calls the initAction with only the initProps values', () =>
      preparePromise.then(() =>
        expect(mockInitAction.mock.calls[0][0]).toEqual({
          bar: 'abc',
          foo: 123,
        }),
      ));
  });
  describe('when not passing one of the values configured in initProps', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const MockWithInit = withInitAction(['foo', 'bar'], () => Promise.resolve())(
      SimpleInitTestComponent,
    );

    it('throws an error', () =>
      expect(() =>
        store.dispatch(
          prepareComponent(MockWithInit, {
            bar: 'abc',
          }),
        ),
      ).toThrow());
  });
  describe('with a component that has a prepared and clientOnly action', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitActionPrepared = jest.fn(() => Promise.resolve());
    const mockInitActionClient = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(
      {
        prepared: mockInitActionPrepared,
        clientOnly: mockInitActionClient,
      },
    )(SimpleInitTestComponent);

    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    it('calls the prepared initAction', () =>
      preparePromise.then(() => expect(mockInitActionPrepared).toHaveBeenCalledTimes(1)));
    it('dispatches INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toMatchSnapshot();
      }));

    it('does not call the clientOnly initAction', () =>
      preparePromise.then(() => expect(mockInitActionClient).not.toHaveBeenCalled()));
  });
  describe('with a component that only has a clientOnly action', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitActionClient = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(
      {
        clientOnly: mockInitActionClient,
      },
    )(SimpleInitTestComponent);

    const disableConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    disableConsoleWarn.mockRestore();
    it('call the prepared initAction', () =>
      preparePromise.then(() => expect(mockInitActionClient).not.toHaveBeenCalled()));
    it('does not dispatch INIT_COMPONENT actions', () =>
      preparePromise.then(() => {
        const actions = store.getActions();
        expect(actions).toEqual([]);
      }));
  });

  it('warns the user about redundant calls with clientOnly initAction components', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitActionClient = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(
      {
        clientOnly: mockInitActionClient,
      },
    )(SimpleInitTestComponent);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    return preparePromise.then(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  it('does not warn the user if there is a prepared action', () => {
    clearComponentIds();
    const store = mockStore(modePrepareAndNothingPrepared);
    const mockInitActionPrepared = jest.fn(() => Promise.resolve());
    const mockInitActionClient = jest.fn(() => Promise.resolve());
    const MockWithInit = withInitAction(
      {
        prepared: mockInitActionPrepared,
        clientOnly: mockInitActionClient,
      },
    )(SimpleInitTestComponent);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const preparePromise = store.dispatch(prepareComponent(MockWithInit, {}));
    return preparePromise.then(() => {
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});
