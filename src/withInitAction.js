import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { createComponentInitStateSelector } from './reducer';
import defaultGetInitState from './utils/defaultGetInitState';
import initComponent from './actions/initComponent';
import { MODE_INIT_SELF } from './initMode';
import {
  INIT_SELF_ASYNC,
  INIT_SELF_UNMOUNT,
  INIT_SELF_BLOCKING,
} from './initSelfMode';
import createPrepareKey from './utils/createPrepareKey';

const componentIds = [];

const INIT_ACTION_PROP_PREPARED = 'prepared';
const INIT_ACTION_PROP_CLIENTONLY = 'clientOnly';

/**
 * Attaches an initialization action to a component.
 * @param {Array<string>} [initProps] An array of names of props that are relevant for
 * initialization. Only these props will be available in the initAction function. A component
 * is required to have these props during mount and when dispatching the prepareComponent action.
 * By default, if these props change value on the client, the component will "re-initialize".
 * See the "options" parameters.
 * @param {function} initAction The initialization action. It receives the following arguments:
 *  - `props` An object containing the values for each of the initProps.
 *  - `dispatch` The redux dispatch function
 *  - `getState` The redux getState function
 * This function MUST return a Promise that resolves once initialization has completed.
 * @param {object} options Additional optional options
 * @param {boolean} [options.reinitialize=true] If true, will call `initAction` again if any of the
 * props defined in `initProps` change after mount. This change is checked using
 * strict equality (===)
 * @param {boolean} [options.allowLazy=false] If `true`, no error will be thrown when the component
 * is mounted without being prepared using `prepareComponent()` first. Instead, the `initAction`
 * will be performed on `componentDidMount` on the client, as if it wasn't mounted on first render.
 * This can be used to do non-critical initialization, like loading data for components that
 * display below the fold.
 * @param {string} [options.initSelf="ASYNC"] A string that indicates the behavior for
 * initialization on the client (`initMode == MODE_INIT_SELF`). Possible values:
 * - "ASYNC" the component will render immediately, even if `initAction` is still pending.
 *   It is recommended to use this option and render a loading indicator or placeholder content
 *   until `initAction` is resolved. This will give the user immediate feedback that something is
 *   being loaded. While the `initAction` is pending, an `isInitializing` prop will be
 *   passed to the component.
 * - "BLOCKING" this will cause this higher-order component not tot mount the target component
 *   until the first initialization has completed. The component will remain mounted during
 *   further re-initialization.
 * - "UNMOUNT" same as "BLOCKING" but it will also unmount the component during re-initialization.
 * - "NEVER" will only initialize on the server (initMode == MODE_PREPARE). Initialization will
 *   be skipped on the client.
 * @param {function} [options.onError] Error handler for errors that occur while executing
 * initAction. If given, errors will be swallowed.
 * @param {function} [options.getPrepareKey] A function that generates a "prepare key" that will be
 * used to uniquely identify a component and its props. It has the following signature:
 * `({string} componentId, {Array} propsArray) => {string}`
 * This defaults to a function that concatenates the `componentId` and the stringified `propsArray`.
 * In most cases, this will ensure that a component instance on the server is matched to the
 * corresponding instance on the client. However, if the props are somehow always different between
 * server and client, you may use this function to generate a key that omits that difference.
 * @param {function} [options.getInitState] A function that takes the Redux state and returns
 * the init state of the reducer from this module. By default, it is assumed that the state is
 * under the "init" property. If the reducer is included elsewhere, this function can be set
 * to retrieve the state.
 * @returns {function(*)}
 */
export default (p1, p2, p3) => {
  let initActionClient = null;
  let initProps = [];
  let initAction = p1;
  let initActionObjectParam = false;
  let options = p2 || {};
  if (
    (typeof p1 === 'object') &&
    (typeof p1[INIT_ACTION_PROP_PREPARED] === 'undefined') &&
    (typeof p1[INIT_ACTION_PROP_CLIENTONLY] === 'undefined')
  ) {
    initProps = p1;
    initAction = p2;
    options = p3 || {};
  }

  if (typeof initAction === 'object') {
    if (
      (typeof initAction[INIT_ACTION_PROP_CLIENTONLY] !== 'function') &&
      (typeof initAction[INIT_ACTION_PROP_PREPARED] !== 'function')
    ) {
      throw new Error(
        `Invalid object passed as initAction to withInitAction. Must have a property "${
          INIT_ACTION_PROP_CLIENTONLY
        }" or  "${
          INIT_ACTION_PROP_PREPARED
        }"`);
    }

    initActionObjectParam = true;
    const initActionPrepared = initAction[INIT_ACTION_PROP_PREPARED] || null;
    initActionClient = initAction[INIT_ACTION_PROP_CLIENTONLY] || null;
    initAction = initActionPrepared;
  } else if (typeof initAction !== 'function') {
    throw new Error(`Invalid initAction param with type '${
      typeof initAction
    }' passed to withInitAction. Expected either a function or an object { [${
      INIT_ACTION_PROP_CLIENTONLY
      }]: function, [${
      INIT_ACTION_PROP_PREPARED
      }]: function }`);
  }

  const {
    reinitialize = true,
    onError,
    getInitState = defaultGetInitState,
    getPrepareKey = createPrepareKey,
    initSelf = INIT_SELF_ASYNC,
    allowLazy = false,
  } = options;

  return (WrappedComponent) => {
    const componentId = WrappedComponent.displayName || WrappedComponent.name;
    if (!componentId) {
      throw new Error('withInitAction() HoC requires the wrapped component to have a displayName');
    }
    // only warn for unique displayName when we do not have a custom getPrepareKey function
    if ((getPrepareKey === createPrepareKey) && componentIds.includes(componentId)) {
      console.warn(`Each Component passed to withInitAction() should have a unique displayName. Found duplicate name "${componentId}"`);
    }
    componentIds.push(componentId);

    const initConfig = {
      componentId,
      initProps,
      initAction,
      initActionClient,
      initActionObjectParam,
      options: { reinitialize, onError, getInitState, initSelf, allowLazy, getPrepareKey },
    };

    class WithInit extends Component {
      static propTypes = {
        __initComponent: PropTypes.func.isRequired,
        __modeInitSelf: PropTypes.bool.isRequired,
        __componentInitState: PropTypes.shape({
          initValues: PropTypes.arrayOf(PropTypes.any).isRequired,
          prepareKey: PropTypes.string.isRequired,
          selfInitState: PropTypes.bool,
          isPrepared: PropTypes.bool.isRequired,
        }).isRequired,
      };

      static displayName = `withInitAction(${componentId})`;

      static WrappedComponent = WrappedComponent;

      constructor(props) {
        super(props);

        const { __modeInitSelf, __componentInitState: { isPrepared } } = props;

        this.state = {
          initializedOnce: !__modeInitSelf && isPrepared,
        };
      }

      componentWillMount() {
        const { initValues, prepareKey } = this.props.__componentInitState;

        this.props.__initComponent(initValues, prepareKey, { caller: 'willMount' }).catch(this.handleInitError);
      }

      componentDidMount() {
        const { initValues, prepareKey } = this.props.__componentInitState;

        this.props.__initComponent(initValues, prepareKey, { caller: 'didMount' }).catch(this.handleInitError);
      }

      componentWillReceiveProps(newProps) {
        const { __componentInitState: { selfInitState } } = newProps;
        if (selfInitState) {
          this.setState(() => ({
            initializedOnce: true,
          }));
        }

        if (initProps.length && reinitialize) {
          const { __componentInitState: { initValues }, __initComponent } = this.props;
          const { __componentInitState: { initValues: newInitValues, prepareKey } } = newProps;

          if (initValues !== newInitValues) {
            __initComponent(newInitValues, prepareKey, { caller: 'willReceiveProps' }).catch(this.handleInitError);
          }
        }
      }

      handleInitError = (e) => {
        if (onError) {
          onError(e);
        } else {
          throw e;
        }
      };

      render() {
        // eslint-disable-next-line no-unused-vars
        const { __componentInitState, __initComponent, __modeInitSelf, ...props } = this.props;
        const { selfInitState, isPrepared } = __componentInitState;

        const isInitializing = __modeInitSelf ? (
          (selfInitState === false) ||
          ((typeof selfInitState === 'undefined') && !this.state.initializedOnce)
        ) : (allowLazy && !isPrepared);

        const cloak = isInitializing && (
          (initSelf === INIT_SELF_UNMOUNT) ||
          ((initSelf === INIT_SELF_BLOCKING) && !this.state.initializedOnce)
        );

        return cloak ? null : (
          <WrappedComponent isInitializing={isInitializing} {...props} />
        );
      }
    }

    const ConnectedWithInit = connect(
      () => {
        const componentInitStateSelector = createComponentInitStateSelector(initConfig);

        return (state, ownProps) => {
          const initState = getInitState(state);
          const __componentInitState = componentInitStateSelector(initState, ownProps);

          return {
            __componentInitState,
            __modeInitSelf: initState.mode === MODE_INIT_SELF,
          };
        };
      },
      dispatch => ({
        __initComponent: (initValues, prepareKey, initOptions) => dispatch(
          initComponent(ConnectedWithInit, initValues, prepareKey, initOptions),
        ),
      }),
    )(WithInit);

    ConnectedWithInit.initConfig = initConfig;

    return ConnectedWithInit;
  };
};

/**
 * Clears the component ids array used to detect duplicate components. Used for
 * testing to clear the state in between tests.
 */
export function clearComponentIds() {
  componentIds.length = 0;
}
