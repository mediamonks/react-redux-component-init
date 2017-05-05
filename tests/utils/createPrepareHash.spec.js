import createPrepareHash from '../../src/utils/createPrepareHash';

describe('createPrepareHash', () => {
  it('should return equal hashes for equal objects with different property orders', () => {
    const objA = { a: 'a', b: 'b' };
    const objB = { a: 'a', b: 'b' };
    const arrayA = [1, 2, 3];
    const arrayB = [1, 2, 3];
    const prepareHashA = createPrepareHash('Foo', [objA, arrayA]);
    const prepareHashB = createPrepareHash('Foo', [objB, arrayB]);
    expect(prepareHashA).toBe(prepareHashB);
  });
  it('should return equal hashes for equal objects with different property orders', () => {
    const objA = { a: 'a', b: 'b' };
    const objB = { b: 'b', a: 'a' };
    const prepareHashA = createPrepareHash('Foo', [objA]);
    const prepareHashB = createPrepareHash('Foo', [objB]);
    expect(prepareHashA).toBe(prepareHashB);
  });
});
