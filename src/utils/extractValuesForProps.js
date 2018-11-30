/**
 * Extracts values from the `target` object for each of the given `props`.
 * @param {object} target The object to retrieve the values from.
 * @param {Array<string>} props An array of property names to retrieve. If a property
 * name has a dot in it, it will look up a nested value. For example, the string
 * `"foo.bar"` will look up the property `bar` on the property `foo` on the given
 * `target` object. If one of the parent properties in this string is not `typeof object`,
 * the value will be `undefined`.
 * @returns {Array} An array of values in the same order as the values passed to the
 * `props` parameter.
 */
export default (target, props) =>
  props.map(prop => {
    const segments = prop.split('.');

    if (segments.length < 2) {
      return target[prop];
    }

    return segments.reduce((result, segment) => {
      if (typeof result !== 'object') {
        return undefined;
      }

      return result[segment];
    }, target);
  });
