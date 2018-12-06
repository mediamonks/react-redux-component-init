---
title: Usage guide
nav_order: 4
has_children: true
permalink: /usage
---
{::comment}


# View the rendered version of this documentation at:
https://mediamonks.github.io/react-redux-component-init



{:/comment}

This guide assumes that the steps in [setup](./setup) have been completed
{: .bg-yellow-000.p-3 }

# Usage

In this guide we will be using an example page that shows a simple forum post. The page
`<PostDetailPage>` is structured like this:

```jsx
// PostDetailPage.jsx
const PostDetailPage = ({ location }) => (
  <>
    <Post id={location.query.id} />

    <Footer />
  </>
);

// Post.jsx
const Post = ({ id, post }) => {
  if (!post) {
    return <LoadingSpinner />
  }

  const { authorId, title, contents } = post;
  return (
    <section className="post">
      <h2>{ title }</h2>
      <UserAvatar userId={authorId} />

      { contents }
      <Comments postId={id} />
    </section>
  );
;
const mapStateToProps = (state, { id }) => ({
  post: state.posts[id],
});
export default connect(mapStateToProps)(Post);
```

In addition to the `<Post>` component, `<Footer>`, `<Comments>`, and `<UserAvatar>` get some
dynamic data from redux and need some initialization actions. This guide will show how to trigger
these actions using `react-redux-component-init`.

[Continue reading: 1. Basic Usage](./basic-usage){: .btn .btn-purple }
