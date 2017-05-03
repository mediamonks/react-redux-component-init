import { propNameValuesToObject } from '../utils/propNameValuesToObject';
import { MODE_INIT_SELF, MODE_PREPARE } from '../initMode';
import { INIT_SELF_NEVER } from '../initSelfMode';

import { INIT_COMPONENT } from './actionTypes';

export default (
  Component,
  initValues,
  prepareHash,
  { isPrepare = false },
) => (dispatch, getState) => {
  if (!Component.initConfig) {
    throw new Error('No init config found on Component passed to initComponent');
  }

  const {
    componentId,
    initProps,
    initAction,
    options: { onError, getInitState, initSelf },
  } = Component.initConfig;

  const initState = getInitState(getState());
  if (!initState) {
    throw new ReferenceError('Could not find init state. Did you attach the init reducer?');
  }
  const { mode, prepared } = initState;

  if (
    ((mode === MODE_INIT_SELF) && (initSelf !== INIT_SELF_NEVER)) ||
    (isPrepare && (typeof prepared[prepareHash] === 'undefined'))
  ) {
    const initPropsObj = propNameValuesToObject(initProps, initValues);

    dispatch({
      type: INIT_COMPONENT,
      payload: {
        complete: false,
        isPrepare,
        prepareHash,
      },
    });

    return Promise.resolve()
      .then(initAction(initPropsObj, dispatch, getState))
      .catch((e) => {
        if (onError) {
          onError(e);
        } else {
          throw e;
        }
      })
      .then((result) => {
        dispatch({
          type: INIT_COMPONENT,
          payload: {
            complete: true,
            isPrepare,
            prepareHash,
          },
        });

        return result;
      });
  } else if (mode === MODE_PREPARE) {
    if (typeof prepared[prepareHash] === 'undefined') {
      const initPropsObj = propNameValuesToObject(initProps, initValues);
      throw new Error(`Expected component "${componentId}" to be prepared but prepareComponent has not been called with props: \n${JSON.stringify(initPropsObj)}`);
    } else if (prepared[prepareHash] === false) {
      throw new Error(`Expected component "${componentId}" to be prepared but preparation is still pending`);
    }
  }

  return Promise.resolve();
};
