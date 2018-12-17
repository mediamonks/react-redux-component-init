---
title: prepareComponent() not called with props
nav_order: 2
parent: Common errors
layout: error
---
{% capture withVars %}
## `Expected component "{Component}" to be prepared but prepareComponent has not been called with props: {initPropsObject}`

### Explanation
The Component _{Component}_ has been wrapped in `withInitAction` and rendered in react with the
following props:

```
{initPropsObject}
```

However, no `prepareComponent` action is dispatched with this exact combination of Component and props.
{% endcapture %}
{% include cloak.html content=withVars name="with-vars" %}

{% capture fallback %}
## `Expected component "{Component}" to be prepared but prepareComponent has not been called with props: ...`

### Explanation
A react component has been wrapped in `withInitAction` and configured with init props. The component
has been rendered with react, but no `prepareComponent` action is dispatched for exactly that component
and the correct props.
{% endcapture %}
{% include cloak.html content=fallback name="fallback" %}

### Possible causes
{% include common-prepare-issues.md %}

#### prepareComponent is called(), but with different values for init props
The values of props passed to `prepareComponent` must match with the props that your component
is mounted with on first render:

```jsx
// prepareComponent call
dispatch(prepareComponent(Post, { id: 6 });
// render function
<Post id={7} /> // <== incorrect: prop value 'id' does not match
```

#### Your init props are different between server and client
If you are only getting this error on the client (in the browser), your component might be rendered
differently between server and client. For example, the server might render `<MyComponent amount={500} />`
while the client renders `<MyComponent amount={0} />`.

{% include common-prepare-issues-edge.md %}

### More details
 - [Setup](../setup)
 - [Api docs for prepareComponent](../api#prepareComponent)
 - [Usage guide: Basic usage](../usage/basic-usage)
 - [Usage guide: Using init props](../usage/using-init-props)
