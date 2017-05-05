import extractPropsFromObject from '../../src/utils/extractPropsFromObject';

describe('extractPropsFromObject', () => {
  it('extract given properties from an object', () => {
    const target = { a: 1, b: 2, c: 'foobar' };
    expect(extractPropsFromObject(target, ['a', 'c'])).toEqual([1, 'foobar']);
  });

  it('returns values in the same order as the given props', () => {
    const target = { a: 1, b: 2, c: 3 };
    expect(extractPropsFromObject(target, ['c', 'a'])).toEqual([3, 1]);
  });

  it('includes an undefined value when a property was not found', () => {
    const target = { a: 1, b: 2, c: 3 };
    expect(extractPropsFromObject(target, ['a', 'd', 'c'])[1]).toBeUndefined();
  });

  it('returns nested values when using dot notation', () => {
    const target = { a: 1, b: { a: 2, b: 3, c: 4 }, c: 5 };
    expect(extractPropsFromObject(target, ['b.a', 'b.b', 'b.c'])).toEqual([2, 3, 4]);
  });

  it('returns deeply nested values', () => {
    const target = { a: { b: { c: { d: 'foobar' } } } };
    expect(extractPropsFromObject(target, ['a.b.c.d'])).toEqual(['foobar']);
  });

  it('returns undefined when requesting child properties on undefined objects', () => {
    const target = { a: { b: { c: { d: 'foobar' } } } };
    expect(extractPropsFromObject(target, ['a.b.x.d'])[0]).toBeUndefined();
  });

  it('returns object values that strictly equal the input object values', () => {
    const testObject = { a: 1, b: 2 };
    const target = { a: testObject };
    expect(extractPropsFromObject(target, ['a'])[0]).toBe(testObject);
  });
});
