/**
 * Wraps a function to create a curried argument that can be passed optionally.
 *
 * @param optionalParamType {string} The type of the optional parameter. If the wrapped function
 * recieves an argument of this type, it will return a new function that can be called to pass
 * the other arguments. If it doesn't match, the optional argument is considered undefined and
 * the inner function `fn` is executed immediately with undefined as the first argument.
 * @param fn A function that will receive the optional curried argument in the first parameter.
 * @returns {Function}
 *
 * @example
 * const test = optionalParamCurried(
 *   'string',
 *   (opt, a, b) => console.log({ opt, a, b })
 * );
 *
 * // intended usage:
 * test('abc')(1, 2); // logs { opt: 'abc', a: 1, b: 2 }
 * test(123, 456); // logs { opt: undefined, a: 123, b: 456 }
 *
 * // incorrect usage:
 * test(1, 2, 3); // redundant 3rd argument. logs { opt: undefined, a: 1, b: 2 }
 * test('abc', 1, 2); // does nothing (returns function)
 *
 */
const optionalParamCurried = (optionalParamType, fn) => (firstArg, ...restArgs) => {
  // eslint-disable-next-line valid-typeof
  if (typeof firstArg === optionalParamType) {
    return (...args) => fn(firstArg, ...args);
  }

  return fn(undefined, firstArg, ...restArgs);
};

export default optionalParamCurried;
