import optionalParamCurried from '../../src/utils/optionalParamCurried';

describe('optionalParamCurried', () => {
  describe('with optionalParamType "string"', () => {
    it('passes undefined if first arg is of type "number"', () => {
      {
        const spy = jest.fn();
        const testFn = optionalParamCurried('string', spy);

        testFn(1, 2, 3)
        expect(spy).toHaveBeenCalledWith(undefined, 1, 2, 3);
      }
    });
    it('passes the curried argument if it is of type "string"', () => {
      {
        const spy = jest.fn();
        const testFn = optionalParamCurried('string', spy);

        testFn('foo')(1, 2, 3);
        expect(spy).toHaveBeenCalledWith('foo', 1, 2, 3);
      }
    });
    it('does not execute the inner function if only the optional param is passed', () => {
      {
        const spy = jest.fn();
        const testFn = optionalParamCurried('string', spy);

        testFn('foo', 1, 2, 3);
        expect(spy).not.toHaveBeenCalled();
      }
    });
  });
});
