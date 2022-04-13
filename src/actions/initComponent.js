import propNameValuesToObject from '../utils/propNameValuesToObject';
import { MODE_INIT_SELF, MODE_PREPARE } from '../initMode';
import PrepareValidationError from '../PrepareValidationError';
import { INIT_SELF_NEVER } from '../initSelfMode';

import { INIT_COMPONENT } from './actionTypes';

/**
 * Action that initializes a single Component. Can be used both during a component prepare
 * and a component self-init.
 *
 * If the current `initMode` is `MODE_PREPARE` and the component has not yet initialized
 * when this action is dispatched, an error will be thrown.
 *
 * **There is probably no need to directly use this action outside of this module.** This
 * action is automatically dispatched by the `withInitAction()` HoC and the `prepareComponent()`
 * thunk.
 *
 * @param {react.Component} Component The React component to initialize. Passing a component that
 * was not wrapped with `withInitAction()` will result in an error.
 * @param {Array} initValues An array of values that correspond with the array of `initProps` for
 * this component. These values are either passed through `prepareComponent()` or extracted from
 * the `props` when a component mounts or updates.
 * @param {string} prepareKey A unique identifier for the component and it's `initValues`. This
 * is generated by the `getPrepareKey()` util.
 * @param {object} [options] Additional options
 * @param {string} options.caller The function from which initialization is triggered. Valid options
 * are 'prepareComponent', 'didMount', 'didUpdate'
 * @returns {function} A thunk function that should be passed directly to the Redux `dispatch`
 * function.
 */
export default (Component, initValues, prepareKey, { caller } = {}) => (dispatch, getState) => {
  if (!Component.initConfig) {
    throw new Error('No init config found on Component passed to initComponent');
  }
  const callerIsPrepare = caller === 'prepareComponent';

  const {
    componentId,
    initProps,
    initAction,
    initActionClient,
    initActionObjectParam,
    options: { onError, getInitState, initSelf, allowLazy },
  } = Component.initConfig;

  const initState = getInitState(getState());
  if (!initState) {
    throw new ReferenceError('Could not find init state. Did you attach the init reducer?');
  }
  const { mode, prepared } = initState;
  const isPrepared = typeof prepared[prepareKey] !== 'undefined';

  let errorNotPrepared;
  let shouldCallInitAction;
  let shouldCallInitActionClient;

  switch (caller) {
    case 'prepareComponent':
      errorNotPrepared = false;
      shouldCallInitAction = !!initAction && !isPrepared;
      shouldCallInitActionClient = false;
      break;
    case 'didMount':
      errorNotPrepared = !!initAction && mode === MODE_PREPARE && !allowLazy;
      shouldCallInitAction =
        !!initAction &&
        // mounted on the client (after first render), lazy not allowed
        ((mode === MODE_INIT_SELF && initSelf !== INIT_SELF_NEVER && !allowLazy) ||
          // first render, not already prepared, lazy allowed
          (mode === MODE_PREPARE && !isPrepared && allowLazy));
      shouldCallInitActionClient = false;
      break;
    case 'didUpdate':
      // reinitialize is checked in withInitAction
      errorNotPrepared = false;
      shouldCallInitAction = !!initAction;
      shouldCallInitActionClient = !!initActionClient;
      break;
    default:
      throw new Error(
        `Unexpected value '${caller}' for caller. Expected one of: 'prepareComponent', 'didMount', 'willMount', 'willReceiveProps'`,
      );
  }

  if (errorNotPrepared) {
    if (typeof prepared[prepareKey] === 'undefined') {
      if (initProps.length) {
        const initPropsObj = propNameValuesToObject(initProps, initValues);
        const initPropsString = JSON.stringify(initPropsObj);
        throw new PrepareValidationError(
          `Expected component "${componentId}" to be prepared but prepareComponent has not been called with props: ${JSON.stringify(
            initPropsObj,
          )}`,
          'prepare-component-not-called-with-props',
          {
            Component: componentId,
            initPropsObject:
              initPropsString.length > 100
                ? `${initPropsString.substring(0, 100)}...`
                : initPropsString,
          },
        );
      } else {
        throw new PrepareValidationError(
          `Expected component "${componentId}" to be prepared but prepareComponent has not been called`,
          'prepare-component-not-called',
          { Component: componentId },
        );
      }
    } else if (prepared[prepareKey] === false) {
      let message = `Component "${componentId}" is preparing but preparation has not completed`;
      const initPropsObj = propNameValuesToObject(initProps, initValues);
      let initPropsString = '(no init props)';

      if (initProps.length) {
        message = `Component "${componentId}" is preparing for props ${JSON.stringify(
          initPropsObj,
        )} but preparation has not completed`;

        initPropsString = JSON.stringify(initPropsObj);
        if (initPropsString.length > 100) {
          initPropsString = `${initPropsString.substring(0, 100)}...`;
        }
      }

      throw new PrepareValidationError(message, 'preparation-not-completed', {
        Component: componentId,
        initPropsObject: initPropsString,
      });
    }
  }

  if (!shouldCallInitAction && !shouldCallInitActionClient) {
    return Promise.resolve();
  }

  const initPropsObj = propNameValuesToObject(initProps, initValues);

  dispatch({
    type: INIT_COMPONENT,
    payload: {
      complete: false,
      isPrepare: callerIsPrepare,
      prepareKey,
    },
  });

  return Promise.resolve()
    .then(() => {
      const initActionReturn = shouldCallInitAction
        ? initAction(initPropsObj, dispatch, getState)
        : Promise.resolve();

      if (typeof initActionReturn.then !== 'function') {
        const error = new Error(
          `Expected initAction${
            initActionObjectParam ? '.server' : ''
          } to return a Promise. Returned an ${typeof initActionReturn} instead. Check the initAction for "${componentId}"`,
        );
        error.isInvalidReturnError = true;
        throw error;
      }

      return initActionReturn;
    })
    .then(serverValue => {
      const initActionClientReturn = shouldCallInitActionClient
        ? initActionClient(initPropsObj, dispatch, getState)
        : Promise.resolve();

      if (typeof initActionClientReturn.then !== 'function') {
        const error = new Error(
          `Expected initAction.client to return a Promise. Returned an ${typeof initActionClientReturn} instead. Check the initAction for "${componentId}"`,
        );
        error.isInvalidReturnError = true;
        throw error;
      }

      return initActionClientReturn.then(clientValue => {
        if (shouldCallInitAction && shouldCallInitActionClient) {
          return [serverValue, clientValue];
        }

        return shouldCallInitAction ? serverValue : clientValue;
      });
    })
    .catch(e => {
      if (onError && !e.isInvalidReturnError) {
        onError(e);
      } else {
        dispatch({
          type: INIT_COMPONENT,
          payload: {
            complete: true,
            isPrepare: callerIsPrepare,
            prepareKey,
          },
        });
        throw e;
      }
    })
    .then(result => {
      dispatch({
        type: INIT_COMPONENT,
        payload: {
          complete: true,
          isPrepare: callerIsPrepare,
          prepareKey,
        },
      });

      return result;
    });
};
