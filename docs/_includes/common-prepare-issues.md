#### Your component is a top-level (page) component
If your component is a top-level component and you're getting this error, there may be an error
in the setup of this library. Please verify you have completed the steps in [setup instructions](../setup).
Specifically, make sure you call `prepareComponents` for your top-level components in the server-side
page rendering function.

#### prepareComponent() not called at all
Please make sure you have called `prepareComponent` for your component…
 - from the init action of the current top-level (page) component \\
   **or**
 - from the init action of another parent component that has been prepared

If you're unsure about how this works, please read [basic usage](../usage/basic-usage)
in the usage guide.
