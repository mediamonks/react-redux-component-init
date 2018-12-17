---
title: prepareComponent() not called
nav_order: 1
parent: Common errors
layout: error
---

## `Expected component "{Component}" to be prepared but prepareComponent has not been called`

### Explanation
{% capture withVars %}
The Component _{Component}_ has been wrapped in `withInitAction` and rendered using react. However,
no `prepareComponent({Component})` action has been dispatched.
{% endcapture %}
{% include cloak.html content=withVars name="with-vars" %}

{% capture fallback %}
A component has been wrapped in `withInitAction` and rendered using react. However, no `prepareComponent`
action has been dispatched for that component.
{% endcapture %}
{% include cloak.html content=fallback name="fallback" %}

### Possible causes
{% include common-prepare-issues.md %}
{% include common-prepare-issues-edge.md %}

### More details
 - [Setup](../setup)
 - [Api docs for prepareComponent](../api#prepareComponent)
 - [Usage guide: Basic usage](../usage/basic-usage)
