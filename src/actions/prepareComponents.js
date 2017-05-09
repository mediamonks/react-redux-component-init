import prepareComponent from './prepareComponent';

/**
 * Simple helper action for preparing multiple components. All components
 * are prepared with the same props.
 *
 * This helper can be useful for preparing a set of route components that were
 * a result of page route matching.
 *
 * @param {Array<react.Component>} components An array of components to initialize.
 * Components that have not been wrapped in `withInitAction` will be ignored.
 * @param {object} props The values of `initProps` that should be used during
 * initialization.
 * @returns {function} A thunk function that should be passed directly to the Redux
 * `dispatch()` function. When passed to `dispatch()` it will return a Promsie that
 * resolves when all components have finished initialization.
 * @example dispatch(prepareComponents([Header,HomePage,Footer], { route: '/home' }));
 */
export default (components, props) => dispatch => Promise.all(
  components.map(Component => dispatch(prepareComponent(Component, props))),
);
