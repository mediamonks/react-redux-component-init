---
title: 2. Using init props
nav_order: 2
parent: Usage guide
---

# Using init props
This guide uses the example page setup described on the [start page of usage guide](./usage)

## Adding init props to an init action
In our [previous example](./basic-usage) we had a basic init action `fetchContactDetails()` that
has no parameters. Often our init actions depend on some value passed through props by the parent
component. Props that are used in init actions are called "_init props_".

The `<Post />` component on our example page needs to initialize by dispatching a `fetchPost()`
action and passing the correct id of the post. We can set the `id` prop of `<Post />` as an init
prop, and use that to call `fetchPost(id)`:

```javascript
// Post.jsx
export default withInitAction(
  ['id'],
  ({ id }, dispatch) => dispatch(fetchPost(id)),
)(
  connect(mapStateToProps)(Post)
);
```

Note that we pass the name of the prop `'id'` as a first argument to `withInitAction()`. Otherwise,
**your init action will not receive this prop.**
{: .bg-yellow-000.p-3 }

Just like our basic component, we need to make sure `prepareComponent()` is called for `<Post />`.
Let's add that to our `<PostDetailPage />` init action.

```javascript
// PostDetailPage.jsx
export default withInitAction(
  (props, dispatch) => dispatch(Promise.all([
    prepareComponent(ContactDetails),
    prepareComponent(Post)
  ])),
)(PostDetailPage);
```

However, **we are not done yet**. `react-redux-component-init` now knows that it needs to call
the init action that contains `fetchPost()`. However, it still has no way of knowing what value to
pass for the init prop _id_. For that reason, it will throw an error:

> Component "Post" expected prop "id" but was not passed to prepareComponent
{: .text-red-300 }

We need to tell `prepareComponent()` the values of all init props. In our example, the post id
is a URL query parameter that `react-router` passes in the props of our top-level component. We need
to update the init action of `<PostDetailPage />` to pass _id_ the query parameter.

```javascript
// PostDetailPage.jsx
export default withInitAction(
  ['location'],
  ({ location }, dispatch) => dispatch(Promise.all([
    prepareComponent(ContactDetails),
    prepareComponent(Post, { id: location.query.id })
  ])),
)(PostDetailPage);
```

## Triggering re-initialize on init prop change
In most cases, you want an init action to dispatch again whenever the init props change value.
`react-redux-component-init` automatically does this for you! To see how reinitialize works in our
 example, imagine the following scenario:

 - a user clicks on a link to a different post with id `"better-post"`
 - this triggers a `history.pushState` with update query: `?id=better-post`
 - `react-router` updates the value of `query.id` in the `location` prop
 - `<PostDetailPage />` will reinitialize, calling `fetchPost("better-post")`
 - The new data is shown in the `<Post />` component

This works _almost_ perfectly, but we still have a small issue. What if `location` updates in some
way we don't care about? For example, say that the user clicks a link to a hash fragment and the
`hash` property on location changes. We don't want to initialize the page again! Luckily, we can
specify the exact property we want to watch in the array passed to `withInitAction()`.

```javascript
// PostDetailPage.jsx
export default withInitAction(
  ['location.query.id'], // <== updated init prop
  ({ location: { query: { id } } }, dispatch) => dispatch(Promise.all([
    prepareComponent(ContactDetails),
    prepareComponent(Post, { id })
  ])),
)(PostDetailPage);
```

Note: the notation `{ location: { query: { id } } }` is an example of how you can use ES6 parameter
destructuring, but it is not required to write your init action using this syntax.
{: .bg-yellow-000.p-3 }

Now `<PostDetailPage />` only reinitializes if the `location.query.id` property changes. Huzzah!

> #### Disabling re-initialize
> {: .mt-0 }
>
> It is also possible to indicate that a component should never automatically reinitialize:
>
> ```javascript
> // Post.jsx
> export default withInitAction(
>   ['id'],
>   ({ id }, dispatch) => dispatch(fetchPost(id)),
>   { reinitialize: false }
> )(
>  connect(mapStateToProps)(Post)
> );
> ```
{: .bg-grey-lt-100.m-4.p-4 }
