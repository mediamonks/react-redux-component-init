/**
 * The possible modes that `react-redux-component-init` can operate under. One is designed for
 * the client side, the other for server side rendering. This mode affects
 * the behavior of the entire module.
 */

/**
 * Mode that is designed for usage on the server. In this mode, this initAction of
 * each component needs to be executed before it is mounted. This is referred to as
 * "preparing a component" and can be done using the `prepareComponent()` action.
 * Mounting a component with an initAction without preparing it first with the same
 * values for initProps will result in an error.
 * @type {string}
 */
export const MODE_PREPARE = 'MODE_PREPARE';
/**
 * Mode that is designed for usage on the client after the initial render has
 * completed. When a component with an initAction is mounted, it will execute
 * the initAction. The exact behavior of this depends on the `initSelf` option
 * passed to `withInitAction()`. See `withInitAction()` and `initSelfMode`
 * for more info.
 * @type {string}
 */
export const MODE_INIT_SELF = 'MODE_INIT_SELF';
