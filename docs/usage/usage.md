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

To keep this guide short, we assume that your components are already connected to a redux store
using [react-redux](https://github.com/reduxjs/react-redux). You should also make sure that you
have completed the steps in [setup](./setup)
{: .bg-yellow-000.p-3 }

# Usage

In the following guides, we will be using an example page that has the following structure:

```xml
<PostDetailPage>
  <Post id="my-first-post">
    <PostTitle>Post Title</PostTitle>
    <UserAvatar userId="jack" />

    <PostContent>
      Hello world
    </PostContent>


    <Comments postId="my-first-post" />
  </Post>

  <Footer>
    <ContactDetails>
  </Footer>
</PostDetailPage>
```

All our components are setup to get their data from a redux store. We also have redux actions that
fetch this data from an API. This guide will explain how to attach these actions to our component
so that they get dispatched at the right time. We will add `react-redux-component-init` to:

 - `<ContactDetails>`
 - `<Post id="my-first-post">`
 - `<Comments postId="my-firs-post" />`

[Continue reading: 1. Basic Usage](./basic-usage){: .btn .btn-purple }
