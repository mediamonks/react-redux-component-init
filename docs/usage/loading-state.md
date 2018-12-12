---
title: 5. Client-side loading states
nav_order: 5
parent: Usage guide
---

# Client-side loading states
On the server, rendering will not start until all prepared init actions have completed. This is
different on the client: components will mount immediately. Here we will layout some approaches to
making sure your application behaves correctly while initialization is still happening.

## Recommended approach: handle missing data in components
By default, `react-router-component-init` will immediately mount your components, even if the init
action has not completed yet. We recommend having checks in your component wherever you use data
that is loaded asynchronously. This has some advantages:

- You can start showing the user parts of your component that do not need initialization
- You can render the layout box of the component, to prevent the page from jumping around once
the content arrives
- Missing data is less likely to cause your entire page to break

Take for example our `<UserAvatar>` component. We can render the surrounding `div` and give that
wrapper `width`, `height` and a `background-color` to fix it in place while `image` is still
being fetched:

```javascript
const UserAvatar = ({ image }) => (
  <div className="user-avatar-wrapper">
    { image && <img src={image} /> }
  </div>
);
```

## Using the isInitializing prop
Alternatively, the `withInitAction()` wrapper will pass an `isInitializing` boolean that tells
your component if an init action is pending:

```javascript
const UserAvatar = ({ image, isInitializing }) => (
  <div className="user-avatar-wrapper">
    { isInitializing ? null : <img src={image} /> }
  </div>
);
```

## Blocking init actions
If you still want to prevent the entire component from mounting, it is also possible to pass the
`"BLOCKING"` or `"UNMOUNT"` option to `withInitAction()`. See the [api documentation](../api) for
more details.

```javascript
const UserAvatar = ({ image }) => (
  <div className="user-avatar-wrapper">
    <img src={image} />
  </div>
);

export default withInitAction(
  ['userId'],
  ({ userId }, dispatch) => dispatch(fetchUserAvatar(userId)),
  { initSelf: 'UNMOUNT' } // <== this will unmount our component if it is (re)initializing
)(
  connect(mapStateToProps)(UserAvatar)
);
```


