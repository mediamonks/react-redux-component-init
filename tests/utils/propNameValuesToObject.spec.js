import propNameValuesToObject from '../../src/utils/propNameValuesToObject';

describe('propNameValuesToObject', () => {
  it('merges arrays of property names and values into an object', () => {
    expect(propNameValuesToObject(['a', 'b', 'c'], [1, 2, 3])).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('ignores superfluous values', () => {
    const props = ['a'];
    const values = [1, 2];
    expect(propNameValuesToObject(props, values).a).toBe(1);
    expect(Object.keys(propNameValuesToObject(props, values))).toHaveLength(1);
  });

  it('defines keys if values are undefined', () => {
    const props = ['a', 'b'];
    const values = [1];
    expect(Object.keys(propNameValuesToObject(props, values))).toHaveLength(2);
  });

  it('creates nested objects for property names with dots', () => {
    const props = ['a.b'];
    const values = [1];
    expect(propNameValuesToObject(props, values)).toEqual({
      a: {
        b: 1,
      },
    });
  });

  it('creates and merge multiple levels of nested props', () => {
    const props = ['a.b.c', 'a.b.d', 'a.c', 'b.c', 'c'];
    const values = [1, 2, 3, 4, 5];
    expect(propNameValuesToObject(props, values)).toEqual({
      a: {
        b: {
          c: 1,
          d: 2,
        },
        c: 3,
      },
      b: {
        c: 4,
      },
      c: 5,
    });
  });
});
