import {
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectId,
  BSONRegExp,
  BSONSymbol,
  Timestamp,
} from 'mongodb';

import { getValue } from '../src/operator';
import { flatten } from '../src/flatten';
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
import { $ } from '../src/array';
import { $and } from '../src/bitwise';
import { $or } from '../src/bitwise';

describe('flatten()', () => {
  describe.each([
    ['null', null],
    ['undefined', undefined],
    ['zero', 0],
    ['empty object', {}],
    ['number', 123],
    ['bigint', BigInt(123456)],
    ['string', 'test'],
    ['boolean', false],
    ['boolean', true],
    ['Date', new Date('2018-06-02T01:05:00')],
    ['array', [1, 2, 3]],
    ['array:empty', []],
    ['array:mixed', [1, true, 'A', { x: 10, y: 20 }]],
    ['RegExp', /test/],
    ['Buffer', Buffer.from('buf')],
  ])(`When value is primitive "%s"`, (_, value) => {
    it(`should return the same value`, () => {
      expect(flatten(value as any)).toStrictEqual(value);
    });

    it(`should return the same nested value`, () => {
      expect(flatten({ value })).toStrictEqual({ $set: { value } });
    });
  });

  describe.each([
    new Binary(Buffer.from('test')),
    new Code('function(){}'),
    new DBRef('test', new ObjectId(ObjectId.generate())),
    new Decimal128('1.23'),
    new Double(4.2),
    new Int32(9),
    new Long(10),
    new MaxKey(),
    new MinKey(),
    new ObjectId(ObjectId.generate()),
    new BSONRegExp('/test/'),
    new BSONSymbol('symbol'),
    new Timestamp(new Long(Date.now())),
  ])('When value is a MongoDB BSON type', (value) => {
    describe(`${value._bsontype}`, () => {
      it('should keep the same value', () => {
        expect(flatten(value)).toStrictEqual(value);
      });

      it('should keep the value in a nested field', () => {
        const data = { field: value };
        expect(flatten(data)).toStrictEqual({ $set: { field: value } });
      });
    });
  });

  describe.each([
    { a: undefined },
    { a: null },
    { a: {} },
    { a: 'test' },
    { a: [1, 2, 3] },
    { a: [1, 2, 3], b: 'test', c: {} },
    { a: true },
    { a: new Date() },
  ])('When plain objects with no instructions', (value) => {
    it('should $set the value', () => {
      expect(flatten(value)).toStrictEqual({ $set: value });
    });
  });

  describe.each([
    ['$inc', $inc(1), $inc(2)],
    ['$mul', $mul(2), $mul(10)],
    ['$rename', $rename('one'), $rename('two')],
    ['$setOnInsert', $setOnInsert(1), $setOnInsert(2)],
    ['$set', $set(1), $set(2)],
    ['$unset', $unset(), $unset()],
    ['$min', $min(100), $min('abc')],
    ['$max', $max(999), $max('xyz')],
    ['$currentDate', $currentDate(), $currentDate('timestamp')],
    ['$currentDate', $timestamp(), $timestamp()],
  ])('When nested object', (type, op1, op2) => {
    it(`Should pass ${type}`, () => {
      const data = { x: { y: { z: { value: op1 } } } };
      expect(flatten(data)).toStrictEqual({
        [type]: {
          'x.y.z.value': getValue(op1),
        },
      });
    });

    it(`Should pass ${type} for multiple fields`, () => {
      const data = {
        a: {
          b: op1,
          c: {
            d: op2,
          },
        },
      };
      expect(flatten(data)).toStrictEqual({
        [type]: {
          'a.b': getValue(op1),
          'a.c.d': getValue(op2),
        },
      });
    });
  });

  describe('When using positional operator', () => {
    it('with $set', () => {
      const obj = { points: $().$set(10) };
      expect(flatten(obj)).toStrictEqual({ $set: { 'points.$': 10 } });
    });

    it('with plain value', () => {
      const obj = { points: $().$set('test') };
      expect(flatten(obj)).toStrictEqual({ $set: { 'points.$': 'test' } });
    });

    it('with $inc', () => {
      const obj = { points: $().$inc(-1) };
      expect(flatten(obj)).toStrictEqual({ $inc: { 'points.$': -1 } });
    });

    it('with $set for a field', () => {
      const obj = { points: $('std').$set(0.5) };
      expect(flatten(obj)).toStrictEqual({ $set: { 'points.$.std': 0.5 } });
    });

    it('with $set for a field in a nested object', () => {
      const obj = { stats: { group: { points: $('std').$set(0.5) } } };
      expect(flatten(obj)).toStrictEqual({
        $set: { 'stats.group.points.$.std': 0.5 },
      });
    });
  });

  describe.each([
    ['$inc', $inc(1), $inc(2)],
    ['$mul', $mul(2), $mul(10)],
    ['$rename', $rename('one'), $rename('two')],
    ['$setOnInsert', $setOnInsert(1), $setOnInsert(2)],
    ['$set', $set(1), $set(2)],
    ['$unset', $unset(), $unset()],
    ['$min', $min(100), $min('abc')],
    ['$max', $max(999), $max('xyz')],
    ['$currentDate', $currentDate(), $currentDate('timestamp')],
    ['$currentDate', $timestamp(), $timestamp()],
  ])('When plain object with operator %s', (type, op1, op2) => {
    it('should set one field', () => {
      const obj = { y: op1 };
      expect(flatten(obj)).toStrictEqual({ [type]: { y: getValue(op1) } });
    });
    it('should set multiple fields', () => {
      const obj = { y: op1, z: op2 };
      expect(flatten(obj)).toStrictEqual({
        [type]: { y: getValue(op1), z: getValue(op2) },
      });
    });
    it('should set multiple fields in nested objects', () => {
      const obj = { y: op1, z: { a: op2, b: op1 } };
      expect(flatten(obj)).toStrictEqual({
        [type]: { y: getValue(op1), 'z.a': getValue(op2), 'z.b': getValue(op1) },
      });
    });
  });

  describe.each([
    [[], []],
    [{ x: [] }, {}],
    [{ x: [10] }, { $set: { 'x.0': 10 } }],
    [
      { x: { y: { z: { value: ['a', 'b', 'c'] } } } },
      { $set: { 'x.y.z.value.0': 'a', 'x.y.z.value.1': 'b', 'x.y.z.value.2': 'c' } },
    ],
    [
      { x: [1], y: [$inc(2)] },
      { $set: { 'x.0': 1 }, $inc: { 'y.0': 2 } },
    ],
    [{ x: { y: [{ z: $mul(2) }] } }, { $mul: { 'x.y.0.z': 2 } }],
    [{ x: [{ y: [{ z: [{ value: 100 }] }] }] }, { $set: { 'x.0.y.0.z.0.value': 100 } }],
    [{ x: [[[{ y: $inc(1) }]]] }, { $inc: { 'x.0.0.0.y': 1 } }],
  ])('When options {array: true}', (value, expected) => {
    it('should flatten arrays', () => {
      expect(flatten(value, { array: true })).toStrictEqual(expected);
    });
  });

  describe.each([
    [{}, {}],
    [{ x: {} }, {}],
    [{ x: [] }, { $set: { x: [] } }],
    [{ x: {}, y: 1 }, { $set: { y: 1 } }],
    [{ x: { y: { z: {} } } }, {}],
    [{ x: { y: { z: {}, a: 1 } } }, { $set: { 'x.y.a': 1 } }],
  ])('When options {skipEmptyObjects: true}', (value, expected) => {
    it('Should skip empty objects', () => {
      expect(flatten(value, { skipEmptyObjects: true })).toStrictEqual(expected);
    });
  });

  describe.each([
    [{ skipEmptyObjects: true, array: false }, { x: [] }, { $set: { x: [] } }],
    [{ skipEmptyObjects: true, array: true }, { x: [] }, {}],
    [{ skipEmptyObjects: true, array: true }, { x: [{}] }, {}],
    [{ skipEmptyObjects: true, array: true }, { x: [[[{}]]] }, {}],
    [{ skipEmptyObjects: false, array: true }, { x: [{}] }, { $set: { 'x.0': {} } }],
    [{ skipEmptyObjects: false, array: true }, { x: [[{}]] }, { $set: { 'x.0.0': {} } }],
  ])('Should verify value for %o', (options, value, expected) => {
    expect(flatten(value, options)).toStrictEqual(expected);
  });

  describe('When using multiple operators', () => {
    it('should set values', () => {
      const obj = {
        a1: 1,
        a2: 11,
        b1: $inc(2),
        b2: $inc(22),
        c1: $mul(3),
        c2: $mul(33),
        d1: $rename('alias_4'),
        d2: $rename('alias_44'),
        e1: $setOnInsert([5]),
        e2: $setOnInsert([5, 5]),
        f1: $set(new Date(2000, 1, 1)),
        f2: $set(new Date(2016, 1, 1)),
        g1: $unset(),
        g2: $unset(),
        h1: $min(8),
        h2: $min(88),
        i1: $max(9),
        i2: $max(99),
        j1: $currentDate(),
        j2: $currentDate('timestamp'),
        k1: $timestamp(),
        k2: $timestamp(),
        l1: $and(5),
        l2: $or(2),
      };

      const expectedValue = {
        $set: {
          a1: 1,
          a2: 11,
          f1: new Date(2000, 1, 1),
          f2: new Date(2016, 1, 1),
        },
        $inc: { b1: 2, b2: 22 },
        $mul: { c1: 3, c2: 33 },
        $rename: { d1: 'alias_4', d2: 'alias_44' },
        $setOnInsert: { e1: [5], e2: [5, 5] },
        $unset: { g1: '', g2: '' },
        $min: { h1: 8, h2: 88 },
        $max: { i1: 9, i2: 99 },
        $currentDate: {
          j1: { $type: 'date' },
          j2: { $type: 'timestamp' },
          k1: { $type: 'timestamp' },
          k2: { $type: 'timestamp' },
        },
        $bit: {
          l1: { and: 5 },
          l2: { or: 2 },
        },
      };
      expect(flatten(obj)).toStrictEqual(expectedValue);
    });
  });

  describe('GitHub issues', () => {
    describe('issues/7', () => {
      it('Should flatten array inside of object', () => {
        const data = {
          ipv4: {
            enable: 'yes',
            rule: [
              {
                flow: {
                  destinationAddress: '0.0.0.0',
                },
              },
            ],
          },
        };

        expect(flatten(data, { array: true })).toStrictEqual({
          $set: {
            'ipv4.enable': 'yes',
            'ipv4.rule.0.flow.destinationAddress': '0.0.0.0',
          },
        });
      });
    });
  });
});
