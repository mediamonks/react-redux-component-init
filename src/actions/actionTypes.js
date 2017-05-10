const prefix = '@@react-redux-component-init/';

/**
 * Action type for switching the initMode of the module. See `initMode`
 * @type {string}
 */
export const SET_INIT_MODE = `${prefix}SET_INIT_MODE`;

/**
 * Action type for initializing a component. Is used both when a component initializes
 * itself, as when a component is prepared using `prepareComponent()`
 * @type {string}
 */
export const INIT_COMPONENT = `${prefix}INIT_COMPONENT`;
