import { createSelector } from 'reselect';

import createShallowArrayCompareSelector from './utils/createShallowArrayCompareSelector';
import { INIT_COMPONENT, SET_INIT_MODE } from './actions/actionTypes';
import extractValuesForProps from './utils/extractValuesForProps';
import createPrepareKey from './utils/createPrepareKey';
import { MODE_PREPARE } from './initMode';

/**
 * Reducer function that manages the state for `react-redux-component-init`. This reducer should
 * be included using Redux's `combineReducers()` under the `init` key in the root of
 * the store state.
 */
export default (state = {
  mode: MODE_PREPARE,
  prepared: {},
  selfInit: {},
}, action) => {
  switch (action.type) {
    case SET_INIT_MODE:
      return {
        ...state,
        mode: action.payload,
      };
    case INIT_COMPONENT:
      if (action.payload.isPrepare) {
        return {
          ...state,
          prepared: {
            ...state.prepared,
            [action.payload.prepareKey]: action.payload.complete,
          },
        };
      }
      return {
        ...state,
        selfInit: {
          ...state.selfInit,
          [action.payload.prepareKey]: action.payload.complete,
        },
      };
    default:
      return state;
  }
};

const createComponentInitValuesSelector = ({ componentId, initProps }) =>
  createShallowArrayCompareSelector(
    (state, props) => extractValuesForProps(props, initProps),
    initValues => ({
      prepareKey: createPrepareKey(componentId, initValues),
      initValues,
    }),
  );

export const createComponentInitStateSelector = initConfig => createSelector(
  createComponentInitValuesSelector(initConfig),
  state => state.selfInit,
  ({ prepareKey, initValues }, selfInit) => ({
    prepareKey,
    initValues,
    initialized: !!selfInit[prepareKey],
  }),
);
