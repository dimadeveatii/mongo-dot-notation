'use strict';

const $ = require('../index');
const mongo = require('mongodb');

describe('# Flatten tests', () => {
  describe('# Primitive types', () => {

    it('When is an empty object returns empty', () => {
      $.flatten({}).should.deep.equal({});
    });

    it('When is number returns the number', () => {
      const n = 123;
      $.flatten(n).should.equal(n);
    });

    it('When is string returns the string', () => {
      const s = 'abc';
      $.flatten(s).should.equal(s);
    });

    it('When is boolean returns the boolean', () => {
      const b = false;
      $.flatten(b).should.equal(b);
    });

    it('when is Date returns the Date', () => {
      const date = new Date();
      $.flatten(date).should.equal(date);
    });

    it('When is Array returns the array', () => {
      const arr = [1, 2, 3];
      $.flatten(arr).should.equal(arr);
    });

    it('When is Array of mixed complex objects returns the array', () => {
      const arr = [1, true, 'A', {x: 10, y: 20}];
      $.flatten(arr).should.deep.equal(arr);
    });
  });

  describe('# MongoDB types', () => {
    const supportedTypes = [
      'Binary',
      'Code',
      'DBRef',
      'Decimal128',
      'Double',
      'Int32',
      'Long',
      'MaxKey',
      'MinKey',
      'ObjectId',
      'ObjectID',
      'BSONRegExp',
      'Symbol',
      'Timestamp'
    ];

    supportedTypes.forEach((mongoType) => {
      describe(mongoType, () => {
        it('Flatten directly', () => {
          const id = new mongo[mongoType]();
          $.flatten(id).should.equal(id);
        });

        it('Flatten as nested property', () => {
          const data = {field: new mongo[mongoType]()};
          $.flatten(data).should.have
            .property('$set').that.have
            .property('field').that.equals(data.field);
        });
      });
    });
  });

  describe('# Simple objects', () => {
    it('When has `a` string property sets the property', () => {
      const obj = { a: 'test' };
      $.flatten(obj).should.have.property('$set')
        .that.deep.equals(obj);
    });

    it('When has `a` array property sets the property', () => {
      const obj = { a: [1, 2, 3] };
      $.flatten(obj).should.have.property('$set')
        .that.deep.equals(obj);
    });

    it('When has many properties sets the properties', () => {
      const obj = { a: [1, 2, 3], b: 'test', c: {} };
      $.flatten(obj).should.have.property('$set')
        .that.deep.equals(obj);
    });
    
    it('When constructor is undefined sets object', () => {
      const obj = { value: 'test' };
      obj.constructor = undefined;
      $.flatten(obj).should.have.property('$set')
        .that.deep.equals(obj);
    });
  });

  describe('# Nested operators ($ positional operator)', () => {
    it('When positional operator with $set', () => {
      const obj = { points: $.$().$set(10) };
      $.flatten(obj).should.deep.equal({ $set: { 'points.$': 10 } });
    });
    
    it('When positional operator with value', () => {
      const obj = { points: $.$().value('test') };
      $.flatten(obj).should.deep.equal({ $set: { 'points.$': 'test' } });
    });
    
    it('When positional operator with $inc', () => {
      const obj = { points: $.$().$inc(-1) };
      $.flatten(obj).should.deep.equal({ $inc: { 'points.$': -1 } });
    });
    
    it('When positional operator with field specified', () => {
      const obj = { points: $.$('std').$set(0.5) };
      $.flatten(obj).should.deep.equal({ $set: { 'points.$.std': 0.5 } });
    });
    
    it('When positional operator with field specified in nested object', () => {
      const obj = {stats: { group: { points: $.$('std').$set(0.5) }}};
      $.flatten(obj).should.deep.equal({ $set: { 'stats.group.points.$.std': 0.5 } });
    });
  });
  
  describe('# Empty values', () =>  {

    it('When property value is null sets to null', () => {
      const obj = { x: null };
      $.flatten(obj).should.deep.equal({ $set: { x: null } });
    });

    it('When property value is undefined sets to undefined', () => {
      const obj = { x: undefined };
      $.flatten(obj).should.deep.equal({ $set: { x: undefined } });
    });

  });

  describe('# Simple objects using operators', () => {

    it('When a property uses $inc', () => {
      const obj = { x: 1, y: $.$inc(2) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $inc: { y: 2 } });
    });

    it('When more properties use $inc', () => {
      const obj = { x: 1, y: $.$inc(), z: $.$inc(10) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $inc: { y: 1, z: 10 } });
    });

    it('When a property uses $mul', () => {
      const obj = { x: 1, y: $.$mul(2) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $mul: { y: 2 } });
    });

    it('When more properties use $mul', () => {
      const obj = { x: 1, y: $.$mul(), z: $.$mul(10) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $mul: { y: 1, z: 10 } });
    });

    it('When a property uses $rename', () => {
      const obj = { x: 1, y: $.$rename(2) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $rename: { y: 2 } });
    });

    it('When more properties use $rename', () => {
      const obj = { x: 1, y: $.$rename('alias 1'), z: $.$rename('alias 2') };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $rename: { y: 'alias 1', z: 'alias 2' } });
    });

    it('When a property uses $setOnInsert', () => {
      const obj = { x: 1, y: $.$setOnInsert(2) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $setOnInsert: { y: 2 } });
    });

    it('When more properties use $setOnInsert', () => {
      const obj = { x: 1, y: $.$setOnInsert([1, 2]), z: $.$setOnInsert(3) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $setOnInsert: { y: [1, 2], z: 3 } });
    });

    it('When a property uses $set', () => {
      const obj = { x: 1, y: $.$set(2) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1, y: 2 } });
    });

    it('When more properties use $set', () => {
      const obj = {
        x: 1,
        y: $.$set([1, 2, 3]),
        z: $.$set({ inner: 'object', a: { b: 'c' } })
      };

      $.flatten(obj).should.deep
        .equal({ $set: { x: 1, y: [1, 2, 3], z: { inner: 'object', a: { b: 'c' } } } });
    });

    it('When a property uses $unset', () => {
      const obj = { x: 1, y: $.$unset() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $unset: { y: '' } });
    });

    it('When more properties use $unset', () => {
      const obj = { x: 1, y: $.$unset(), z: $.$unset() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $unset: { y: '', z: '' } });
    });

    it('When a property uses $min', () => {
      const obj = { x: 1, y: $.$min(10) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $min: { y: 10 } });
    });

    it('When more properties use $min', () => {
      const obj = { x: 1, y: $.$min(-1), z: $.$min('abc') };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $min: { y: -1, z: 'abc' } });
    });

    it('when a property uses $max', () => {
      const obj = { x: 1, y: $.$max(10) };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $max: { y: 10 } });
    });

    it('when more properties use $max', () => {
      const obj = { x: 1, y: $.$max(-1), z: $.$max('abc') };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $max: { y: -1, z: 'abc' } });
    });

    it('When a property uses $currentDate', () => {
      const obj = { x: 1, y: $.$currentDate() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $currentDate: { y: { $type: 'date' } } });
    });

    it('When more properties use $max', () => {
      const obj = { x: 1, y: $.$currentDate(), z: $.$currentDate() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $currentDate: { y: {$type: 'date'}, z: {$type: 'date'} } });
    });

    it('When a property uses $timestamp', () => {
      const obj = { x: 1, y: $.$timestamp() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $currentDate: { y: { $type: 'timestamp' } } });
    });

    it('When more properties use $timestamp', () => {
      const obj = { x: 1, y: $.$timestamp(), z: $.$timestamp() };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1 }, $currentDate: { y: { $type: 'timestamp' }, z: { $type: 'timestamp' } } });
    });

    it('When a property uses null', () => {
      const obj = { x: 1, y: null };
      $.flatten(obj).should.deep
        .equal({ $set: { x: 1,  y: null } });
    });

    it('When uses all field operators', () => {
      const obj = {
        a1: 1, a2: 11,
        b1: $.$inc(2), b2: $.$inc(22),
        c1: $.$mul(3), c2: $.$mul(33),
        d1: $.$rename('alias 4'), d2: $.$rename('alias 44'),
        e1: $.$setOnInsert([5]), e2: $.$setOnInsert([5, 5]),
        f1: $.$set(new Date(2000, 1, 1)), f2: $.$set(new Date(2016, 1, 1)),
        g1: $.$unset(), g2: $.$unset(),
        h1: $.$min(8), h2: $.$min(88),
        i1: $.$max(9), i2: $.$max(99),
        j1: $.$currentDate(), j2: $.$currentDate(),
        k1: $.$timestamp(), k2: $.$timestamp()
      };

      const expectedValue = {
        $set: { a1: 1, a2: 11, f1: new Date(2000, 1, 1), f2: new Date(2016, 1, 1) },
        $inc: { b1: 2, b2: 22 },
        $mul: { c1: 3, c2: 33 },
        $rename: { d1: 'alias 4', d2: 'alias 44' },
        $setOnInsert: { e1: [5], e2: [5, 5] },
        $unset: { g1: '', g2: '' },
        $min: { h1: 8, h2: 88 },
        $max: { i1: 9, i2: 99 },
        $currentDate: { j1: { $type: 'date' }, j2: { $type: 'date' }, k1: { $type: 'timestamp' }, k2: { $type: 'timestamp' } },
      };
      $.flatten(obj).should.deep.equal(expectedValue);
    });
  });

  describe('# Nested objects', () => {
    it('When has inner property', () => {
      const obj = { a: {b: {c: 1}} };
      $.flatten(obj).should.deep.equal({$set: {'a.b.c': 1}});
    });

    it('When has inner property that is empty object', () => {
      const obj = { a: {} };
      $.flatten(obj).should.deep.equal({$set: {'a': {}}});
    });

    it('When has many inner properties', () => {
      const obj = {
        a: {
          b: {
            c: 1,
            d: 2,
            x: {
              y: {
                z: [1]
              }
            }
          }
        },
        x: 'test'
      };

      const expectedValue = {
        $set: {
          'a.b.c': 1,
          'a.b.d': 2,
          'a.b.x.y.z': [1],
          x: 'test'
        }
      };

      $.flatten(obj).should.deep.equal(expectedValue);
    });

    it('When has many inner properties with operators', () => {
      const id = new mongo.ObjectID();
      const obj = {
        id: id,
        a: {
          b: {
            c: $.$min(1),
            d: 2,
            x: {
              y: {
                z: $.$inc(3),
                w: $.$min(100)
              },
              t: $.$mul(5)
            }
          }
        },
        n: $.$set({a: {b: {c: 'd'}}}),
        x: $.$rename('test')
      };

      const expectedValue = {
        $set: {
          'id': id,
          'a.b.d': 2,
          'n': { a: { b: { c: 'd' } } }
        },
        $min: { 'a.b.c': 1, 'a.b.x.y.w': 100 },
        $inc: { 'a.b.x.y.z': 3 },
        $mul: { 'a.b.x.t': 5 },
        $rename: { 'x': 'test' }
      };

      $.flatten(obj).should.deep.equal(expectedValue);
    });
  });
});