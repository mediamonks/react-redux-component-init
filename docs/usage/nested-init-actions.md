---
title: 3. Nested init actions
nav_order: 3
parent: Usage guide
---

# Nested init actions
This guide uses the example page setup described on the [start page of usage guide](./usage)

## Preparing children of components with init actions
Our `<Post>` component from the [previous example](./using-init-props) has a child component
`<Comments>` which needs to fetch some comments based on a `postId` prop. It is tempting to also
prepare this component in the init action of our page `<PostDetailPage>`, like so:


> **Incorrect approach: prepare everything on the top level**
> ```javascript
> export default withInitAction(
>   ['location'],
>   ({ location }, dispatch) => dispatch(Promise.all([
>     prepareComponent(Footer),
>     prepareComponent(Post, { id: location.query.id })
>     prepareComponent(Comments, { postId: location.query.id })
>   ])),
> )(PostDetailPage);
> ```
{: .bg-red-000.m-1.p-4 }

This will get the job done, but it is not according to the **component-based approach** that this
library was written for. The problem is that `<PostDetailPage>` should not know about the
`<Comments>` component, because it is part of the `<Post>` component. We should be able to
remove or change `<Comments>` inside `<Post>` without breaking parent
components. In other words, our `<Post>` should be properly isolated.

To fix this, we should move the `prepareComponent()` call for `<Comments>` to the init action of
`<Post>`:

```javascript
// Post.jsx
export default withInitAction(
  ['id'],
  ({ id }, dispatch) => Promise.all([
    dispatch(fetchPost(id)),
    dispatch(prepareComponent(Comments, { postId: id }),
  ]),
)(
  connect(mapStateToProps)(Post)
);
```

Note how we use `Promise.all` here: we need to make sure that this init action does not complete
before **both** `fetchPost` and `prepareComponent` have completed.
{: .bg-yellow-000.p-3 }

## Preparing child components that depend on the parent init action
Our `<Post>` component is almost ready, but it still needs to prepare the `<UserAvatar>` component,
that will asynchronously fetch the avatar for the post author. To do this, `<UserAvatar>` needs
an `userId` prop that should come from the `authorId` inside the `post` data. This means that we
have to complete `fetchPost` **before** we prepare `<UserAvatar>`. Luckily, this isn't too
complicated in a Promise-based solution:

```javascript
// Post.jsx
export default withInitAction(
  ['id'],
  ({ id }, dispatch) => Promise.all([
    dispatch(fetchPost(id)).then(
      post => prepareComponent(UserAvatar, { userId: post.authorId }),
    ),
    dispatch(prepareComponent(Comments, { postId: id }),
  ]),
)(
  connect(mapStateToProps)(Post)
);
```

___

We have functional page now, but it turns out we introduced a performance issue. Our server is
taking some time to load all the comments, which delays the delivery of the entire page! Let's move
this work away from the server, so we can show the `<PostDetailPage>` to our users faster.

[Continue reading: 4. Client-only init actions](./client-only){: .btn .btn-purple }



