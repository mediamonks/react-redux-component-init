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
This guide uses the example page setup described on the [start page of usage guide](./usage)

## Initializing a basic component

Below we will load the contact details to fill our `<ContactDetails />` component. This is a good
place to start because that initialization task has no parameters. We need to do 2 things:

1. Wrap `<ContactDetails />` in `withInitAction()`
2. Prepare `<ContactDetails />` on our parent page (`<PostDetailPage />`)

### 1. Adding an init action to ContactDetails
Our `<ContactDetails />` component has a `react-redux` `connect()` call to retrieve contact
information from the store. Something like this:

```jsx
// ContactDetails.jsx
const mapStateToProps = state => ({
  address: state.contact.address,
  email: state.contact.email,
});

export default connect(mapStateToProps)(ContactDetails);
```

We have a `fetchContactDetails()` thunk action that returns a promise once our contact details are
loaded. Let's add this action as an _init action_ using `withInitAction()`.

```javascript
// ContactDetails.jsx
import { withInitAction } from 'react-redux-component-init';
import { fetchContactDetails } from './actions/apiActions';
```
```javascript
// Update the export to:
export default withInitAction(
  (props, dispatch) => dispatch(fetchContactDetails()),
)(
  connect(mapStateToProps)(ContactDetails)
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
// ContactDetails.jsx
> import { compose } from 'redux';
> ```
> ```javascript
> const addInitAction = withInitAction(
>   (props, dispatch) => dispatch(fetchContactDetails()),
> );
> const connector = connect(mapStateToProps);
>
> export default compose(withInitAction, connector)(ContactDetails);
> ```
{: .bg-grey-lt-100.m-4.p-4 }

### 2. Preparing the ContactDetails component on our page
Currently, `react-redux-component-init` has no way of knowing that `<ContactDetails />` will be on
your page before rendering with react. That means it did not call `fetchContactDetails()`. This
is likely to cause serious issues in your application. That's why when you render the page, it will
immediately throw the following error:

> Expected component "ContactDetails" to be prepared but prepareComponent has not been called...
{: .text-red-300 }

To fix this, we can _prepare_ our components by dispatching `prepareComponent()`. Remember from the
[setup instructions](../setup) that `prepareComponents()` is already dispatched for our top-level
page component `<PostDetailPage />`. We will now add `withInitAction()` to our `<PostDetailPage />`
to make sure `<ContactDetails />` is also prepared.


```javascript
// PostDetailPage.jsx
import { withInitAction, prepareComponent } from 'react-redux-component-init';
import ContactDetails from './components/ContactDetails';
```
```javascript
// Update the export to:
export default withInitAction(
  (props, dispatch) => dispatch(prepareComponent(ContactDetails)),
)(PostDetailPage);
```

---
Our `<ContactDetails />` is now fully setup! Let's summarize what happens once we render the page:

- The server calls `prepareComponents()` on the top-level component `<PostDetailPage />`
- `<PostDetailPage />` has an init action that calls `prepareComponent()` on our `<ContactDetails />`
- The init action for `<ContactDetails />` calls `fetchContactDetails()`. This will fetch data
from the api and store it in the redux store
- The server can now render the page using react

Let's look at a more complex component next.

[Continue reading: 2. Using init props](./using-init-props){: .btn .btn-purple }
