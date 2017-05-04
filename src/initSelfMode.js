/**
 * Possible values for the `selfInit` option of `withInitAction()`
 */

/**
 * The component will render immediately, even if `initAction` is still pending.
 * It is recommended to use this option and render a loading indicator or placeholder content
 * until `initAction` is resolved. This will give the user immediate feedback that something is
 * being loaded. While the `initAction` is pending, an `isInitializing` prop will be passed to
 * the component.
 * @type {string}
 */
export const INIT_SELF_ASYNC = 'ASYNC';

/**
 * This will cause the component not to be mounted until the first initialization has completed.
 * The component will remain mounted during any reinitialization.
 * @type {string}
 */
export const INIT_SELF_BLOCKING = 'BLOCKING';

/**
 * The same behavior as `INIT_SELF_BLOCKING` but it will also unmount the component during
 * reinitialization.
 * @type {string}
 */
export const INIT_SELF_UNMOUNT = 'UNMOUNT';

/**
 * Only execute initAction on the server (initMode == MODE_PREPARE). Initialization will
 * be skipped on the client. This is the opposite of setting `lazy: true` in `withInitAction()`
 * @type {string}
 */
export const INIT_SELF_NEVER = 'NEVER';
