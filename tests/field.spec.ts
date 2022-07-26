import {
  $currentDate,
  $inc,
  $max,
  $min,
  $mul,
  $rename,
  $set,
  $setOnInsert,
  $timestamp,
  $unset,
} from '../src/field';
import { getType, getValue, isOperator } from '../src/operator';

describe('Field update operators', () => {
  describe.each([
    ['$set', $set({ x: 100 }), { x: 100 }],
    ['$unset', $unset(), ''],
    ['$rename', $rename('test'), 'test'],
    ['$inc', $inc(42), 42],
    ['$mul', $mul(10), 10],
    ['$min', $min(9), 9],
    ['$max', $max(99), 99],
    ['$setOnInsert', $setOnInsert('red'), 'red'],
    ['$currentDate', $currentDate('timestamp'), { $type: 'timestamp' }],
    ['$currentDate', $timestamp(), { $type: 'timestamp' }],
  ])('%s()', (type, operator, value) => {
    it('Should be operator', () => {
      expect(isOperator(operator)).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType(operator)).toStrictEqual(type);
    });

    it('Should verify value', () => {
      expect(getValue(operator)).toStrictEqual(value);
    });
  });

  describe.each([
    ['$inc', $inc(), 1],
    ['$mul', $mul(), 1],
    ['$currentDate', $currentDate(), { $type: 'date' }],
  ])('%s()', (_, operator, value) => {
    it('Should verify the default value', () => {
      expect(getValue(operator)).toStrictEqual(value);
    });
  });
});
