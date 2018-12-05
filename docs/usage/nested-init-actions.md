---
title: 3. Nested init actions
nav_order: 3
parent: Usage guide
---

# Nested init actions
This guide uses the example page setup described on the [start page of usage guide](./usage)

## Preparing children of components with init actions
Our `<Post />` component from the [previous example](./using-init-props) has a child component
`<Comments />` which also expects a `postId` prop. It is tempting to add this component to
the init action of our page `<PostDetailPage />`, like so:

~~~
export default withInitAction(
  ['location'],
  ({ location }, dispatch) => dispatch(Promise.all([
    prepareComponent(ContactDetails),
    prepareComponent(Post, { id: location.query.id })
    prepareComponent(Comments, { postId: location.query.id })
  ])),
)(PostDetailPage);
~~~
{: .language-javascript .bg-red-000 }
