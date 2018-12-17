---
title: expected initAction.client to return a Promise
nav_order: 5
parent: Common errors
layout: error
---

{% capture withVars %}
## `Expected {initActionType} to return a Promise. Returned a {returnType} instead. Check the initAction for "{Component}"`
{% endcapture %}
{% include cloak.html content=withVars name="with-vars" %}

{% capture fallback %}
## `Expected initAction to return a Promise. Returned a {type} instead. Check the initAction for "Component"`
{% endcapture %}
{% include cloak.html content=fallback name="fallback" %}

### Explanation
Init actions are usually asynchronous, so they should return a Promise. Because it is easy to forget
returning the promise from the function, this library errors if something other than a Promise is
returned.

### Solution
Make sure that your init action returns a Promise. In the rare case that your init action is
synchronous, simply return `Promise.resolve()`.

### More details
 - [Api docs for withInitAction](../api#withInitAction)
