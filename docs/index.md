---
title: When to use / motivation
nav_order: 1
---
{::comment}


# View the rendered version of this documentation at:
https://mediamonks.github.io/react-redux-component-init



{:/comment}
# When to use
This library is designed for usage in large-scale react applications with server-side rendering. It
can also be used in smaller applications or application without server-side rendering. However, in
these use cases a less complex solution might be more appropriate.

## prerequisites
This library will only work for applications that have the following setup:
 - A react+redux setup with server-side rendering. Redux state on the server should be injected
 into the client as initial state
 (as described in [the Redux documentation](http://redux.js.org/docs/recipes/ServerRendering.html))
 - A Redux store configured with the [redux-thunk](https://github.com/gaearon/redux-thunk) middleware
 - Support for Promises on both the server and client side

# Motivation
In a react application, we often want to perform a certain action when a component mounts. These
actions are often asynchonous (like loading some data from an api). More specifically, in
isomorphic applications (with server side rendering) we often want these actions to be completed
before we start rendering the page. In order to achieve this, we have two alternatives:
 - **Component-based approach:** We define the initialization actions on each component. This comes
 with a problem: the server does not know which components are mounted before a react render has
 completed. This would mean we have to do at least 2 render calls: one to figure out which
 components need to be initialized, and another after initialization actions have completed.
 - **Top-down approach:** We define all initialization on the page level. This can get messy very
 quickly, because a page has to have knowledge about the data needs of all descendant components.
 It is easy to make a mistake and do too little or too much initialization. Moreover, it can lead
 to code duplication between pages.

This library aims to provide utilities to make the *component based approach* a feasible solution.
It allows us to define initialization on each component without having to do more than one render.

---

[Continue reading: Core concepts](./core-concepts.md){: .btn .btn-purple }
