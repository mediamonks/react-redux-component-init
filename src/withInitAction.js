import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { createComponentInitStateSelector } from './reducer';
import defaultGetInitState from './utils/defaultGetInitState';
import initComponent from './actions/initComponent';
import { MODE_INIT_SELF } from './initMode';
import {
  INIT_SELF_ASYNC,
  INIT_SELF_NEVER,
  INIT_SELF_UNMOUNT,
  INIT_SELF_BLOCKING,
} from './initSelfMode';

const componentIds = [];

export default (p1, p2, p3) => {
  let initProps = [];
  let initAction = p1;
  let options = p2 || {};
  if (typeof p1 === 'object') {
    initProps = p1;
    initAction = p2;
    options = p3 || {};
  }

  const {
    reinitialize = true,
    onError,
    getInitState = defaultGetInitState,
    initSelf = INIT_SELF_ASYNC,
  } = options;

  return (WrappedComponent) => {
    const componentId = WrappedComponent.displayName || WrappedComponent.name;
    if (!componentId) {
      throw new Error('withInitAction() HoC requires the wrapped component to have a displayName');
    }
    if (componentIds.includes(componentId)) {
      throw new Error(`Each Component passed to withInitAction() should have a unique displayName. Found duplicate name "${componentId}"`);
    }
    componentIds.push(componentId);

    const initConfig = {
      componentId,
      initProps,
      initAction,
      options: { reinitialize, onError, getInitState, initSelf },
    };

    class WithInit extends Component {
      static propTypes = {
        __initComponent: PropTypes.func.isRequired,
        __modeInitSelf: PropTypes.bool.isRequired,
        __componentInitState: PropTypes.shape({
          initValues: PropTypes.arrayOf(PropTypes.any).isRequired,
          prepareHash: PropTypes.string.isRequired,
          initialized: PropTypes.bool.isRequired,
        }).isRequired,
      };

      static displayName = `withInitAction(${componentId})`;

      static WrappedComponent = WrappedComponent;


      componentWillMount() {
        const { initValues, prepareHash } = this.props.__componentInitState;

        if (initSelf !== INIT_SELF_NEVER) {
          this.props.__initComponent(this, initValues, prepareHash).catch(this.handleInitError);
        }
      }

      componentWillReceiveProps(newProps) {
        if (newProps.__componentInitState.initialized) {
          this.initializedOnce = true;
        }

        if (initProps.length && reinitialize) {
          const { __componentInitState: { initValues }, __initComponent } = this.props;
          const { __componentInitState: { initValues: newInitValues } } = newProps;

          if (initValues !== newInitValues) {
            __initComponent(this, newInitValues).catch(this.handleInitError);
          }
        }
      }

      initializedOnce = false;

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
        const { initialized } = __componentInitState;
        const isInitializing = (initSelf !== INIT_SELF_NEVER) && __modeInitSelf && !initialized;
        const cloak = isInitializing && (
          (initSelf === INIT_SELF_UNMOUNT) ||
          ((initSelf === INIT_SELF_BLOCKING) && !this.initializedOnce)
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
      { __initComponent: initComponent },
    )(WithInit);

    ConnectedWithInit.initConfig = initConfig;

    return ConnectedWithInit;
  };
};
