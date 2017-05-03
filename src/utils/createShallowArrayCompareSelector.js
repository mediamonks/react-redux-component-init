import { createSelectorCreator, defaultMemoize } from 'reselect';

export default createSelectorCreator(
  defaultMemoize,
  (a, b) => (
    (a.length === b.length) &&
    a.every((val, index) => (val === b[index]))
  ),
);
