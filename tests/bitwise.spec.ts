import { $and, $bit, $or, $xor } from '../src/bitwise';
import { getType, getValue, isOperator } from '../src/operator';

describe('Bitwise update operators', () => {
  describe('$bit()', () => {
    it('Should be operator', () => {
      expect(isOperator($bit())).toStrictEqual(true);
    });

    it('Should have no value', () => {
      expect(getValue($bit())).toBeUndefined();
    });

    describe.each([
      ['$and', $bit().$and(1), { and: 1 }],
      ['$or', $bit().$or(2), { or: 2 }],
      ['$xor', $bit().$xor(3), { xor: 3 }],
    ])('.%s()', (_, operator, value) => {
      it('Should be operator', () => {
        expect(isOperator(operator)).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType(operator)).toStrictEqual('$bit');
      });

      it('Should verify value', () => {
        expect(getValue(operator)).toStrictEqual(value);
      });
    });
  });

  describe.each([
    ['$and', $and(1), { and: 1 }],
    ['$or', $or(2), { or: 2 }],
    ['$xor', $xor(3), { xor: 3 }],
  ])('.%s()', (_, operator, value) => {
    it('Should be operator', () => {
      expect(isOperator(operator)).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType(operator)).toStrictEqual('$bit');
    });

    it('Should verify value', () => {
      expect(getValue(operator)).toStrictEqual(value);
    });
  });
});
