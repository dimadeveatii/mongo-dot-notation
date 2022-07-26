import { create, getType, getValue, isOperator } from '../src/operator';

describe('Operator', () => {
  describe('create()', () => {
    it('Should create an operator', () => {
      expect(create('test', 42)).toBeTruthy();
    });

    it('Should have no enumerable fields', () => {
      expect(Object.keys(create('test', 42))).toHaveLength(0);
    });

    it('Should set the type', () => {
      expect(getType(create('$inc', 1))).toStrictEqual('$inc');
    });

    it.each([null, undefined, false, 0, {}, [], 9, 'test', { a: 1 }])(
      'Should set the value',
      (value) => {
        expect(getValue(create('$set', value))).toStrictEqual(value);
      }
    );
  });

  describe('getType()', () => {
    it('Should return the type', () => {
      expect(getType(create('$inc', 1))).toStrictEqual('$inc');
    });

    it('Should return undefined when not an operator', () => {
      expect(getType({})).toBeUndefined();
    });
  });

  describe('getValue()', () => {
    it.each([null, undefined, false, 0, {}, [], 9, 'test', { a: 1 }])(
      'Should return the value',
      (value) => {
        expect(getValue(create('$inc', value))).toStrictEqual(value);
      }
    );

    it('Should return undefined when not an operator', () => {
      expect(getValue({})).toBeUndefined();
    });
  });

  describe('isOperator()', () => {
    it.each([create('$inc', 1), create('$set', null)])(
      'Should return true when operator',
      (operator) => {
        expect(isOperator(operator)).toStrictEqual(true);
      }
    );

    it.each([null, undefined, 0, 'Operator', { _value: 42 }, [1, 2, 3], false])(
      'Should return false when not an operator',
      (operator) => {
        expect(isOperator(operator)).toStrictEqual(false);
      }
    );
  });
});
