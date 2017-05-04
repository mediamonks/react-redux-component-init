import prepareComponent from './prepareComponent';

/**
 * Simple helper action for preparing multiple components. All components
 * are prepared with the same props. This action should be dispatched using
 * the Redux `dispatch` function.
 *
 * This helper can be useful for preparing a set of route components that were
 * a result of page route matching.
 *
 * @param {Array<React.Component>} components An array of components to initialize.
 * Components that have not been wrapped in `withInitAction` will be ignored.
 * @param {object} props The values of `initProps` that should be used during
 * initialization.
 * @returns {Promise} A Promise that resolves when all components have finished
 * initialization
 */
export default (components, props) => dispatch => Promise.all(
  components.map(Component => dispatch(prepareComponent(Component, props))),
);
