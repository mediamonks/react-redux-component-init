import { MODE_PREPARE } from '../initMode';
import extractPropsFromObject from '../utils/extractPropsFromObject';
import createPrepareHash from '../utils/createPrepareHash';

import initComponent from './initComponent';

/**
 * Action that prepares a single component. Duplicate calls with exactly the same
 * `Component` and `props` will be ignored.
 *
 * @param {React.Component} Component The component to prepare. If the component was not
 * wrapped in `withInitAction`, this action will have no effect and returns a Promise that
 * resolves immediately.
 * @param {object} props The values of `initProps` to initialize this component with. These
 * values should be the same as the props that the component will eventually mount with. Omitting
 * one of the `initProps` values configured in `withInitAction()` will result in an error.
 * @returns A thunk function that should be passed directly to the Redux `dispatch` function.
 * @example dispatch(prepareComponent(Comment, { commentId: 5 }));
 */
export default (Component, props) =>
  (dispatch, getState) => {
    // unwrap other HoC if no initConfig is found
    while (!Component.initConfig && Component.WrappedComponent) {
      Component = Component.WrappedComponent; // eslint-disable-line no-param-reassign
    }

    if (Component.initConfig) {
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
      if (mode === MODE_PREPARE) {
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
    }

    return Promise.resolve();
  };
