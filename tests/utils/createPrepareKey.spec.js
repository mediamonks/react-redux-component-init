import createPrepareKey from '../../src/utils/createPrepareKey';

describe('createPrepareKey', () => {
  it('should return equal keys for equal objects with different property orders', () => {
    const objA = { a: 'a', b: 'b' };
    const objB = { a: 'a', b: 'b' };
    const arrayA = [1, 2, 3];
    const arrayB = [1, 2, 3];
    const prepareKeyA = createPrepareKey('Foo', [objA, arrayA]);
    const prepareKeyB = createPrepareKey('Foo', [objB, arrayB]);
    expect(prepareKeyA).toBe(prepareKeyB);
  });
  it('should return equal keys for equal objects with different property orders', () => {
    const objA = { a: 'a', b: 'b' };
    const objB = { b: 'b', a: 'a' };
    const prepareKeyA = createPrepareKey('Foo', [objA]);
    const prepareKeyB = createPrepareKey('Foo', [objB]);
    expect(prepareKeyA).toBe(prepareKeyB);
  });
  it('should return different keys for different componentId', () => {
    const prepareKeyA = createPrepareKey('Foo', [1, 2, 3]);
    const prepareKeyB = createPrepareKey('Bar', [1, 2, 3]);
    expect(prepareKeyA).not.toBe(prepareKeyB);
  });
  it('should return different keys for different props', () => {
    const prepareKeyA = createPrepareKey('Foo', [1, 2, 3]);
    const prepareKeyB = createPrepareKey('Foo', [1, 0, 3]);
    expect(prepareKeyA).not.toBe(prepareKeyB);
  });
  it('should return different keys for different prop orders', () => {
    const prepareKeyA = createPrepareKey('Foo', [1, 2, 3]);
    const prepareKeyB = createPrepareKey('Foo', [2, 1, 3]);
    expect(prepareKeyA).not.toBe(prepareKeyB);
  });
});
