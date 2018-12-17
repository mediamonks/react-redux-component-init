---
title: preparation not completed
nav_order: 2
parent: Common errors
layout: error
---

## `Component "{Component}" is preparing but preparation has not completed`

### Explanation
{% capture withVars %}
A call has been made to `prepareComponent` for _{Component}_ with the following init props:

```
{initPropsObject}
```

However, react has started rendering before the Promise returned from `prepareComponent` had resolved.

### Possible solution
You have likely called `prepareComponent` from another init action without using the returned
promise. For example:

```
// MyPage.jsx
export default withInitAction(
  (props, dispatch) => {
    dispatch(prepareComponent({Component})); // <== return value unused
    return dispatch(prepareComponent(SomeOtherComponent));
  },
)(MyPage);
```

To wait until multiple calls to `prepareComponent` have completed, use `Promise.all()`:

```
// MyPage.jsx
export default withInitAction(
  (props, dispatch) => {
    return Promise.all([
      dispatch(prepareComponent({Component})),
      dispatch(prepareComponent(SomeOtherComponent))
    ]);
  },
)(MyPage);
```

{% endcapture %}
{% include cloak.html content=withVars name="with-vars" %}

{% capture fallback %}
A call has been made to `prepareComponent` for the component you are trying to render. However,
react has started rendering before the Promise returned from `prepareComponent` had resolved.

### Possible solution
You have likely called `prepareComponent` from another init action without using the returned
promise. For example:

```
// MyPage.jsx
export default withInitAction(
  (props, dispatch) => {
    dispatch(prepareComponent(MyComponent)); // <== return value unused
    return dispatch(prepareComponent(SomeOtherComponent));
  },
)(MyPage);
```

To wait until multiple calls to `prepareComponent` have completed, use `Promise.all()`:

```
// MyPage.jsx
export default withInitAction(
  (props, dispatch) => {
    return Promise.all([
      dispatch(prepareComponent(MyComponent)),
      dispatch(prepareComponent(SomeOtherComponent))
    ]);
  },
)(MyPage);
```

{% endcapture %}
{% include cloak.html content=fallback name="fallback" %}

### More details
 - [Api docs for prepareComponent](../api#prepareComponent)
 - [Usage guide: Using init props](../usage/using-init-props)
