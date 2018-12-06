---
title: 4. Client-only init actions
nav_order: 4
parent: Usage guide
---

# Client-only init actions
This guide uses the example page setup described on the [start page of usage guide](./usage)

## Deferring initialization to the client (browser)

This feature will be in the next release (v1.0)
{: .bg-red-000.m-1.p-6 }

Sometimes we don't want a component to initialize on the server. Here are some example reasons:

 - We want to load a component later because it is not critical to the user experience
 - The component is only visible below the page fold, once the user has scrolled
 - The init action handles some sensitive data that should not be accessed by the server
 - The init action uses some data that is only available in the browser, like `localStorage`

In our example, the `<Comments>` component should be initialized later because of the first to
reasons listed above. We could skip `react-redux-component-init` and just add our action to the
`componentDidMount()` hook of `<Comments>`. However, we don't want to refactor our components every
time we move work between client and server. It is also convenient to have all our initialization
work in the same place. For these reasons, this library also supports deferring work to the client.

### Setting our Comments init action to client-only
This can be achieved by wrapping our initialization function in an object with the `clientOnly`
property:

```javascript
// Comments.jsx
export default withInitAction(
  ['postId'],
  { clientOnly: ({ postId }, dispatch) => dispatch(fetchComments(postId)) }
)(
  connect(mapStateToProps)(Comments)
);
```

> #### Mixing client-only and prepared work
> {: .mt-0 }
>
> It is also possible to split initialization between both types. Just pass both a `clientOnly`
> and `prepared` property to `withInitAction`:
>
> ```javascript
> export default withInitAction({
>   clientOnly: (props, dispatch) => dispatch(doSecondaryWork())
>   prepared: (props, dispatch) => dispatch(doCriticalWork())
> })(SomeComponent);
> ```
{: .bg-grey-lt-100.m-4.p-4 }

### Optional: removing prepareComponent() calls
When a component has no prepared init action, calls `prepareComponent()` will be ignored. If we
prefer to do so, we could remove `prepareComponent(Comments, ...)` from `<Post>` now.

___

[Continue reading: 5. Client-side loading states](./loading-state){: .btn .btn-purple }
