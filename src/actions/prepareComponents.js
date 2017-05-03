import prepareComponent from './prepareComponent';

export default (components, props) => dispatch => Promise.all(
  components.map(Component => dispatch(prepareComponent(Component, props))),
);
