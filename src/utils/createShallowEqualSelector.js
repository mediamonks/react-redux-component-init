import { createSelectorCreator, defaultMemoize } from 'reselect';

function isShallowEqual(a, b) {
  if ((typeof a !== 'object') || (typeof b !== 'object')) {
    return a === b;
  }

  const aIsArray = Array.isArray(a);
  const bIsArray = Array.isArray(b);

  if (aIsArray !== bIsArray) {
    return false;
  }

  if (aIsArray) {
    return (a.length === b.length) && a.every((val, index) => val === b[index]);
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  return keysA.every(key => (a[key] === b[key]));
}

const createShallowEqualSelector = createSelectorCreator(defaultMemoize, isShallowEqual);

export default createShallowEqualSelector;
