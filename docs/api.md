---
title: API
nav_order: 4
---

# API
{: .no_toc }

1. TOC
{:toc}

## withInitAction `([initProps], initAction, [options])(Component)`
{: #withInitAction }

Higher-order component that adds initialization configuration to an existing component.
 - `initProps` `{Array<string>}` _(optional)_ An array of names of `props` that are relevant for initialization.
   - Only the values of these props are available in the `initAction` function
   - On component mount, a value is required for each of these props
   - The values that these props will have on mount need to be provided to `prepareComponent()`
   - Component preparation using `withPrepare()` only executes once for each combination of these props. Duplicate calls (with the same `Component` and the same values for `initProps`) will be ignored.
   - By default, if these props change value on the client, the component will "re-initialize". See `options` below
   - Dot notation can be used to define a subset of an object prop. For example, when using `['foo.bar', 'foo.foobar']` the `initAction`  will only get the properties `bar` and `foobar` on the `foo` prop.
 - `initAction` `{(props, dispatch, getState) => Promise}` This is the actual initialization function. This function **must return a Promise** that resolves when initialization is complete. It receives the following arguments:
   - `props` `{object}` An object containing values of the props defined in `initProps`. If `initProps` is not defined, this is an empty object.
   - `dispatch` `{function}` The Redux dispatch function. This can be used to dispatch initialization actions or dispatch the `withPrepare()` action for child components
   - `getState` `{function}` The Redux getState function.
 - `options` `{object}` _(optional)_ An object containing additional options:
   - `allowLazy` If `true`, no error will be thrown when the component is mounted without being prepared using `prepareComponent()` first. Instead, the `initAction` will be performed on `componentDidMount` on the client, as if it wasn't mounted on first render. This can be used to do non-critical initialization, like loading data for components that display below the fold. _Defaults to `false`_
   - `reinitialize` If `true`, will call `initAction` again if any of the props defined in `initProps` change after mount. This change is checked with strict equality (===) _Defaults to `true`_
   - `initSelf` A string that indicates the behavior for initialization on the client (`initMode == MODE_INIT_SELF`). Possible values:
     - `"ASYNC"` _(default)_ the component will render immediately, even if `initAction` is still pending. It is recommended to use this option and render a loading indicator or placeholder content until `initAction` is resolved. This will give the user immediate feedback that something is being loaded. While the `initAction` is pending, an `isInitializing` prop will be passed to the component.
     - `"BLOCKING"` this will cause this higher-order component not tot mount the target component until the first initialization has completed. The component will remain mounted during further re-initialization.
     - `"UNMOUNT"` same as `"BLOCKING"` but it will also unmount the component during re-initialization.
     - `"NEVER"` will only initialize on the server (`initMode == MODE_PREPARE`). Initialization will be skipped on the client.
   - `onError` Error handler for errors in `initAction`.  If given, errors will be swallowed.
   - `getPrepareKey` A function that generates a "prepare key" that will be used to uniquely identify a component and its props. It has the following signature:
  ```({string} componentId, {Array} propsArray) => {string}```
  This defaults to a function that concatenates the `componentId` and the stringified `propsArray`. In most cases, this will ensure that a component instance on the server is matched to the corresponding instance on the client. However, if the props are somehow always different between server and client, you may use this function to generate a key that omits that difference.
   - `getInitState` A function that takes the Redux state and returns the init state of the reducer from this module. By default, it is assumed the state is under the `init` property. If the reducer is included elsewhere, this function can be set to retrieve the state.

### example
{: .no_toc }

``` jsx
// PostComponent.js
class Post extends React.Component {
  // ...
}

export default withInitAction(
  ['id'],
  ({ id }, dispatch) => dispatch(loadPostData(id)),
  { allowLazy: true }
)(Post);

// PostPage.js
import Post from './components/PostComponent';
// ...
class PostPage extends React.Component {
  // ...
  render() {
    // ...
    <Post id={this.props.location.query.postId} />
    // ...
  }
}

export default withInitAction(
  ['location.query'],
  ({ location: { query } }) => dispatch(prepareComponent(Post, { id: query.postId }))
)(PostPage);
```


## prepareComponent `(Component, props)`
{: #prepareComponent }

Action creator to prepare a component for rendering on the server side (`initMode == MODE_PREPARE`). Should be passed to the Redux dispatch function. Returns a Promise that resolves when preparation is complete
 - `Component` `{react.Component}` The component that should be prepared. This should be a component returned by the `withInitAction` higher-order component. If no `withInitAction` wrapper is around the Component, dispatching this action will have no effect.
 - `props` `{object}` The props to prepare the component with. These should be the same props as you expect to pass when you eventually render component. It should at least include the props configured in the `initProps` array of `withInitAction`.

## prepareComponents `(components, props)`
{: #prepareComponents }

A shorthand action creator for multiple `prepareComponent` calls with the same `props`. Returns a Promise that resolves when preparation for all components is complete
 - `components` `{Array<react.Component>}` An array of components to prepare
 - `props` `{object}` The props to prepare with

## setInitMode `(initMode)`
{: #setInitMode }

An action creator to switch the `initMode` of the application. Should be called with `MODE_INIT_SELF` after the initial render on the client.
 - `initMode` `{string}` Either of the modes `MODE_PREPARE` or `MODE_INIT_SELF` as defined in the `initMode` export of this module
