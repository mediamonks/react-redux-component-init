---
title: API
nav_order: 5
---
{::comment}


# View the rendered version of this documentation at:
https://mediamonks.github.io/react-redux-component-init



{:/comment}
# API
{: .no_toc }

1. TOC
{:toc}

## withInitAction `([initProps], initAction, [options])(Component)`
{: #withInitAction }

Higher-order component that adds an _init action_ to an existing component.

### Arguments
{: .no_toc }

##### `initProps: Array<string>`{: .fs-4 } **optional**{: .label .label-green}
{: .no_toc }

An array of names of React props that your init action depends on
 - On component mount, a value is required for each of these props
 - The values for these props need to be provided to
 `prepareComponent()` (see [basic usage](./usage/basic-usage))
 - By default the component will "re-initialize" if these props change value on the client.
 See `reinitialize` in `options` below
 - Dot notation can be used to define a subset of an object prop. For example, when using
 `['foo.bar', 'foo.foobar']`{: style="white-space: nowrap"} the `initAction`  will only get the properties `bar` and `foobar`
 on the `foo` prop. (see [using init props](./usage/using-init-props))

##### `initAction: Function | { [clientOnly]: Function, [prepared]: Function }`{: .fs-4 }
{: .no_toc }

This is the actual initialization function with signature
`(props, dispatch, getState) => Promise`{: style="white-space: nowrap"}

 - [basic usage](./usage/basic-usage) For regular init actions you can pass a single function here.
 - [client-only](./usage/client-only) If some part of you init action needs to be executed on
 client-side only, you can pass an object with the client-side initialization function on the `clientOnly`
 property, and (optionally) the server prepared initialization on the `prepared` property.

The function(s) **must return a Promise** that resolves when initialization is complete. The following
arguments are passed:
 - `props: Object` An object containing values of the props defined in `initProps`. If `initProps`
 is not defined, this is an empty object.
 - `dispatch: Function` The Redux dispatch function. This can be used to dispatch your redux
 actions or dispatch the `prepareComponent()` action for child components
 - `getState: Function` The Redux getState function.

##### `options: Object`{: .fs-4 } **optional**{: .label .label-green}
{: .no_toc }

An object with additional options.
 - `reinitialize` If `true`, will call `initAction` again if any of the props defined in `initProps`
 change after mount. This change is checked with strict equality (===) _Defaults to `true`_
 - `initSelf` A string that indicates the behavior for initialization on the client
 (`initMode == MODE_INIT_SELF`). See an example usage below. Possible values:
   - `INIT_SELF_ASYNC` = `"ASYNC"`{: style="color: #6A8759" } **default**{: .label .label-yellow} \\
   the component will render immediately, even if `initAction` is still pending. It is recommended
   to use this option and render a loading indicator or placeholder content until `initAction` is
   resolved. This will give the user immediate feedback that something is being loaded. While the
   `initAction` is pending, an `isInitializing` prop will be passed to the component.
   - `INIT_SELF_BLOCKING` = `"BLOCKING"`{: style="color: #6A8759" } \\
   this will cause this higher-order component not tot mount the target component until the first
   initialization has completed. The component will remain mounted during further re-initialization.
   - `INIT_SELF_UNMOUNT` = `"UNMOUNT"`{: style="color: #6A8759" } \\
   same as `INIT_SELF_BLOCKING` but it will also unmount the component during re-initialization.
   - `INIT_SELF_NEVER` = `"NEVER"`{: style="color: #6A8759" } \\
   will only initialize on the server
   (`initMode == MODE_PREPARE`). Initialization will be skipped on the client.
 - `onError` Error handler for errors in `initAction`.  If given, errors will be swallowed.
 - `getPrepareKey: (componentId: string, propsArray: Array) => string` A function that generates a
 "prepare key" that will be used to uniquely identify a component and its props. It has the
 following signature:
 This defaults to a function that concatenates the `componentId` and the stringified `propsArray`.
 In most cases, this will ensure that a component instance on the server is matched to the
 corresponding instance on the client. However, if the props are somehow always different
 between server and client, you may use this function to generate a key that omits that difference.
 - `getInitState` A function that takes the Redux state and returns the init state of the reducer
 from this module. By default, it is assumed the state is under the `init` property. If the reducer
 is included elsewhere, this function can be set to retrieve the state.
 - `allowLazy` **advanced**{: .label .label-red} In most cases you want to use the `clientOnly`
 property in `initAction` to defer initialization to the client (see
 [client-only init actions](./usage/client-only)). Use this option if you have an init action that
 sometimes needs to be deferred to the client, and sometimes prepared on the server. If `true`,
 calling `prepareComponent()` for the `prepared` init action becomes optional. If you do not prepare
 the component, no error will be thrown and initialization is automatically deferred to the client.
 This has no effect on any `clientOnly` init actions. _Defaults to `false`_

### example
{: .no_toc }

``` jsx
// Post.js
import { withInitAction, INIT_SELF_BLOCKING } from 'react-redux-component-init';
import { loadPostData } from '../actions/api';

class Post extends React.Component {
  // ...
}

export default withInitAction(
  ['id'],
  ({ id }, dispatch) => dispatch(loadPostData(id)),
  { initSelf: INIT_SELF_BLOCKING }
)(Post);
```
``` jsx
// PostPage.js
import { withInitAction, prepareComponent } from 'react-redux-component-init';
import Post from './components/Post';
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

### Arguments
{: .no_toc }

Action to prepare a component for rendering on the server side (`initMode == MODE_PREPARE`). Should
be passed to the Redux dispatch function. Returns a Promise that resolves when preparation is
complete

##### `Component: react.Component`{: .fs-4 }
{: .no_toc }
The component that should be prepared. This should be a component returned by the `withInitAction`
higher-order component. If `Component` has no `withInitAction` wrapper or only has a `clientOnly`
action, dispatching this action will have no effect.


##### `props: object`{: .fs-4 }
{: .no_toc }
The props to prepare the component with. These should be the same props as you expect to pass when
you eventually render component. It should at least include the props configured in the `initProps`
 array of `withInitAction`.
Duplicate calls to `prepareComponent()` with the same `Component` and `props` will be ignored.

### Example
{: .no_toc }
```javascript
dispatch(prepareComponent(MyComponent, { id: 45 }))
```

## prepareComponents `(components, props)`
{: #prepareComponents }

A shorthand action creator for multiple `prepareComponent()` calls with the same `props`. Returns a
Promise that resolves when preparation for all components is complete

### Arguments
{: .no_toc }

##### `components: Array<react.Component>`{: .fs-4 }
{: .no_toc }

An array of components to prepare


##### `props: object`{: .fs-4 }
{: .no_toc }

The props to prepare with. See [prepareComponent()](#prepareComponent)

### Example
{: .no_toc }
```javascript
dispatch(prepareComponents([SomeComponent, OtherComponent], { id: 45 }))
```

## setInitMode `(initMode)`
{: #setInitMode }

An action to switch the `initMode` of the application. Should be called with `MODE_INIT_SELF` after
the initial render on the client.

### Arguments
{: .no_toc }

##### `initMode: string`{: .fs-4 }
{: .no_toc }
Either of the modes `MODE_PREPARE` or `MODE_INIT_SELF` as defined in the `initMode` export of
this module

### Example
{: .no_toc }
```javascript
import { initMode, MODE_INIT_SELF } from 'react-redux-component-init';
// ...
dispatch(setInitMode(MODE_INIT_SELF));
```
