/**
 * Converts an array of property names with an array of corresponding values to an
 * object.
 * @param {Array<string>} propNames An array of property names. A dot in the property
 * name indicates nesting. For example, the property name `"foo.bar"` indicates that
 * the result should have an object `foo` with the property `bar`.
 * @param {Array} propValues An array of values that correspond to the property names
 * in the `propNames` array.
 * @returns {object} The result object
 */
export default (propNames, propValues) => propNames.reduce(
  (result, propName, index) => {
    const segments = propName.split('.');

    if (segments.length < 2) {
      result[propName] = propValues[index]; // eslint-disable-line no-param-reassign
    } else {
      const finalPropName = segments.pop();
      let target = result;
      segments.forEach((segment) => {
        if (typeof target[segment] !== 'object') {
          target[segment] = {};
        }

        target = target[segment];
      });
      target[finalPropName] = propValues[index];
    }

    return result;
  },
  {},
);
