import { MODE_PREPARE } from '../initMode';
import extractPropsFromObject from '../utils/extractPropsFromObject';
import createPrepareHash from '../utils/createPrepareHash';

import initComponent from './initComponent';

export default (Component, props) =>
  (dispatch, getState) => {
    // unwrap other HoC if no initConfig is found
    while (!Component.initConfig && Component.WrappedComponent) {
      Component = Component.WrappedComponent; // eslint-disable-line no-param-reassign
    }

    const {
      componentId,
      initProps,
      options: { lazy, getInitState },
    } = Component.initConfig;

    const initState = getInitState(getState());
    if (!initState) {
      throw new ReferenceError('Could not find init state. Did you attach the init reducer?');
    }

    const { mode } = initState;
    if (mode === MODE_PREPARE && Component.initConfig) {
      const initValues = extractPropsFromObject(props, initProps);

      initValues.forEach((initValue, index) => {
        if (typeof initValue === 'undefined') {
          throw new ReferenceError(`Component "${componentId}" expected prop "${initProps[index]}" but was not passed to prepareComponent`);
        }
      });

      if (!lazy) {
        const prepareHash = createPrepareHash(componentId, initValues);

        return dispatch(initComponent(Component, initValues, prepareHash, {
          isPrepare: true,
        }));
      }
    }

    return Promise.resolve();
  };
