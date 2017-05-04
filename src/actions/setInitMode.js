import { SET_INIT_MODE } from './actionTypes';

/**
 * Action creator to switch the `initMode` this module operates in.
 * @param {string} initMode The new `initMode`. Should be either `initMode.MODE_PREPARE` or
 * `initMode.MODE_INIT_SELF`
 * @returns {object} A Redux action object
 */
export default initMode => ({
  type: SET_INIT_MODE,
  payload: initMode,
});
