

#### prepareComponent() is called but the action is not dispatched
You may have forgotton to pass the `prepareComponent` action to redux `dispatch`:

```javascript
export default withInitAction(
  (props, dispatch) => prepareComponent(MyComponent), // <== forgot to dispatch!
  // fix: (props, dispatch) => dispatch(prepareComponent(MyComponent))
)(MyPage);
```

#### prepareComponent() is called with the unwrapped (inner) component
You may have exported the unwrapped version of your component. For example:

```javascript
// MyComponent.jsx
export class MyComponent extends React.Component {
  // ...
}

export default withInitAction(
  // ...
)(MyComponent);
```
```javascript
// another module
import { MyComponent } from './components/MyComponent'; // <== accidentally imported the unwrapped component!
// ...
dispatch(prepareComponent(MyComponent));
```

#### prepareComponent() is called from a clientOnly init action
`clientOnly` init actions are not called on the server. If this is where you dispatch `prepareComponent`,
it will not happen in time. For example:

```javascript
// <Post> Component
export default withInitAction(
  ['postId', 'authorId'],
  {
    clientOnly: ({ postId, authorId }, dispatch) => Promise.all([
      dispatch(fetchPostComments(postId)),
      dispatch(prepareComponent(UserAvatar, { userId: authorId })),
    ])
  }
)(Post);

// <UserAvatar> Component (rendered inside <Post>)
export default withInitAction(
  ['userId'],
  ({ userId }, dispatch) => dispatch(prepareUserAvatar(userId))
)(UserAvatar);
```

There are 3 solutions possible for this:

 1. split your parent init action between `prepared` and `clientOnly`
    ```javascript
    // Change <Post> to:
    export default withInitAction(
      ['postId', 'authorId'],
      {
        prepared: ({ postId, authorId }, dispatch) => dispatch(prepareComponent(UserAvatar, { userId: authorId })),
        clientOnly: ({ postId, authorId }, dispatch) => dispatch(fetchPostComments(postId))
      }
    )(Post);
    ```
 2. make the entire parent action `prepared`
    ```javascript
    // Change <Post> to:
    export default withInitAction(
      ['postId', 'authorId'],
      ({ postId, authorId }, dispatch) => Promise.all([
        dispatch(fetchPostComments(postId)),
        dispatch(prepareComponent(UserAvatar, { userId: authorId })),
      ])
    )(Post);
    ```
 3. change all child components of `clientOnly` actions to also be `clientOnly`
    ```javascript
    // Change <UserAvatar> to:
    export default withInitAction(
      ['userId'],
      { clientOnly: ({ userId }, dispatch) => dispatch(prepareUserAvatar(userId)) }
    )(UserAvatar);
    // Change <Post> to:
    export default withInitAction(
      ['postId', 'authorId'],
      {
        clientOnly: ({ postId, authorId }, dispatch) => dispatch(fetchPostComments(postId)),
        // prepareComponent no longer necessary for clientOnly UserAvatar
      }
    )(Post);
    ```
