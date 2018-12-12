---
title: 1. Basic usage
nav_order: 1
parent: Usage guide
---
{::comment}


# View the rendered version of this documentation at:
https://mediamonks.github.io/react-redux-component-init



{:/comment}

# Basic Usage
This guide uses the example page setup described on the [start page of usage guide](../usage)

## Initializing a basic component

Below we will fetch links from an API to show in our `<Footer>` component. This is a good
place to start because that initialization task has no parameters. We need to do 2 things:

1. Wrap `<Footer>` in `withInitAction()`
2. Prepare `<Footer>` on our parent page (`<PostDetailPage>`)

### 1. Adding an init action to Footer
Our `<Footer>` component has a `react-redux` `connect()` call to retrieve footer links from the
store. Something like this:

```jsx
// Footer.jsx
const mapStateToProps = state => ({
  links: state.footer.links
});

export default connect(mapStateToProps)(Footer);
```

We have a `fetchFooterLinks()` thunk action that returns a promise once our links are fetched
from the API. Let's add this action as an _init action_ using `withInitAction()`.

```javascript
// Footer.jsx
import { withInitAction } from 'react-redux-component-init';
import { fetchFooterLinks } from './actions/apiActions';
```
```javascript
// Update the export to:
export default withInitAction(
  (props, dispatch) => dispatch(fetchFooterLinks()),
)(
  connect(mapStateToProps)(Footer)
);
```

> #### Optional: compose() higher order components
> {: .mt-0 }
>
> You might find the braces getting a bit messy when using multiple higher-order components like
> `withInitAction()` and `connect()`. One way to clean this up is by using the redux `compose()`
> utility.
>
> ```javascript
// Footer.jsx
> import { compose } from 'redux';
> ```
> ```javascript
> const addInitAction = withInitAction(
>   (props, dispatch) => dispatch(fetchFooterLinks()),
> );
> const connector = connect(mapStateToProps);
>
> export default compose(withInitAction, connector)(Footer);
> ```
{: .bg-grey-lt-100.m-4.p-4 }

### 2. Preparing the Footer component on our page
Currently, `react-redux-component-init` has no way of knowing that `<Footer>` will be on
your page before rendering with react. That means it did not call `fetchFooterLinks()`. This
is likely to cause serious issues in your application. That's why when you render the page, it will
immediately throw the following error:

> Expected component "Footer" to be prepared but prepareComponent has not been called...
{: .text-red-300 }

To fix this, we can _prepare_ our components by dispatching `prepareComponent()`. Remember from the
[setup instructions](../setup) that `prepareComponents()` is already dispatched for our top-level
page component `<PostDetailPage>`. We will now add `withInitAction()` to our `<PostDetailPage>`
to make sure `<Footer>` is also prepared.


```javascript
// PostDetailPage.jsx
import { withInitAction, prepareComponent } from 'react-redux-component-init';
import Footer from './components/Footer';
```
```javascript
// Update the export to:
export default withInitAction(
  (props, dispatch) => dispatch(prepareComponent(Footer)),
)(PostDetailPage);
```

You only have to prepare components that are mounted **on the initial page render by the server**.
Components that are mounted later by the browser do not need to be prepared.
{: .bg-yellow-000.p-3 }

---
Our `<Footer>` is now fully setup! Let's summarize what happens once we render the page:

- The server calls `prepareComponents()` on the top-level component `<PostDetailPage>`
- `<PostDetailPage>` has an init action that calls `prepareComponent()` on our `<Footer>`
- The init action for `<Footer>` calls `fetchFooterLinks()`. This will fetch data
from the api and store it in the redux store
- The server can now render the page using react

Let's look at a more complex component next.

[Continue reading: 2. Using init props](./using-init-props){: .btn .btn-purple }
