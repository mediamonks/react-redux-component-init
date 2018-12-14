---
title: prepareComponent() expected prop
nav_order: 1
parent: Common errors
layout: error
---

## `Component "{Component}" expected prop "{propName}" but no value was passed to prepareComponent()`

### Explanation
{% capture withVars %}
You passed the following `initProps` argument to [withInitAction](../api#withInitAction) for the
component _{Component}_:

```
{initProps}
```

[prepareComponent](../api#prepareComponent) needs to know which values to pass to your init action
but you did not provide a value for the prop `{propName}`.

### Solution
Please provide a value for `{propName}` in the second argument of [prepareComponent](../api#prepareComponent).
{% endcapture %}
{% include cloak.html content=withVars name="with-vars" %}

{% capture fallback %}
You passed the `initProps` argument to [withInitAction](../api#withInitAction) for
the component you are trying to prepare. [prepareComponent](../api#prepareComponent) needs to know
the values of these props to pass them to your init action, but you did not provide a value for
all of them.

### Solution
Please provide a value for all your init props in the second argument of [prepareComponent](../api#prepareComponent).
{% endcapture %}
{% include cloak.html content=fallback name="fallback" %}

### More details
 - [Api docs for prepareComponent](../api#prepareComponent)
 - [Usage guide: Using init props](../usage/using-init-props)
