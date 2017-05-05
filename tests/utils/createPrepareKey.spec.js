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
});
