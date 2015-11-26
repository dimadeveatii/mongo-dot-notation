'use strict'

var expect = require('chai').expect
var dot = require('../index')
var op = dot.Operators

var ObjectID = require('mongodb').ObjectID

describe('#primitive types scenarios', function () {
  it('when is an empty object returns empty', function () {
    var obj = {}
    expect(dot.flatten(obj)).to.deep.equal({})
  })

  it('when is number returns the number', function () {
    var n = 123
    expect(dot.flatten(n)).to.equal(n)
  })

  it('when is string returns the string', function () {
    var s = 'abc'
    expect(dot.flatten(s)).to.equal(s)
  })

  it('when is boolean returns the boolean', function () {
    var b = false
    expect(dot.flatten(b)).to.equal(b)
  })

  it('when is Date returns the Date', function () {
    var date = new Date()
    expect(dot.flatten(date)).to.equal(date)
  })

  it('when is ObjectID returns the object', function () {
    var id = new ObjectID()
    expect(dot.flatten(id)).to.equal(id)
  })

  it('when is Array returns the Array', function () {
    var arr = [1, 2, 3]
    expect(dot.flatten(arr)).to.equal(arr)
  })
})

describe('#one-level scenarios', function () {
  it('when has `a` string property sets the property', function () {
    var obj = { a: 'test' }
    expect(dot.flatten(obj)).to.have.property('$set')
      .that.deep.equals(obj)
  })

  it('when has `a` array property sets the property', function () {
    var obj = { a: [1, 2, 3] }
    expect(dot.flatten(obj)).to.have.property('$set')
      .that.deep.equals(obj)
  })

  it('when has many properties sets the properties', function () {
    var obj = { a: [1, 2, 3], b: 'test', c: {} }

    expect(dot.flatten(obj)).to.have.property('$set')
      .that.deep.equals(obj)
  })
})

describe('#one-level scenarios with operators', function () {
  it('when a property is $inc', function () {
    var obj = { x: 1, y: op.$inc(2) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $inc: { y: 2 } })
  })

  it('when more properties are $inc', function () {
    var obj = { x: 1, y: op.$inc(), z: op.$inc(10) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $inc: { y: 1, z: 10 } })
  })

  it('when a property is $mul', function () {
    var obj = { x: 1, y: op.$mul(2) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $mul: { y: 2 } })
  })

  it('when more properties are $mul', function () {
    var obj = { x: 1, y: op.$mul(), z: op.$mul(10) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $mul: { y: 1, z: 10 } })
  })

  it('when a property is $rename', function () {
    var obj = { x: 1, y: op.$rename(2) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $rename: { y: 2 } })
  })

  it('when more properties are $rename', function () {
    var obj = { x: 1, y: op.$rename('alias 1'), z: op.$rename('alias 2') }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $rename: { y: 'alias 1', z: 'alias 2' } })
  })

  it('when a property is $setOnInsert', function () {
    var obj = { x: 1, y: op.$setOnInsert(2) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $setOnInsert: { y: 2 } })
  })

  it('when more properties are $setOnInsert', function () {
    var obj = { x: 1, y: op.$setOnInsert([1, 2]), z: op.$setOnInsert(3) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $setOnInsert: { y: [1, 2], z: 3 } })
  })

  it('when a property is $set', function () {
    var obj = { x: 1, y: op.$set(2) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1, y: 2 } })
  })

  it('when more properties are $set', function () {
    var obj = {
      x: 1,
      y: op.$set([1, 2, 3]),
      z: op.$set({ inner: 'object', a: { b: 'c' } })
    }

    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1, y: [1, 2, 3], z: { inner: 'object', a: { b: 'c' } } } })
  })

  it('when a property is $unset', function () {
    var obj = { x: 1, y: op.$unset() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $unset: { y: '' } })
  })

  it('when more properties are $unset', function () {
    var obj = { x: 1, y: op.$unset(), z: op.$unset() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $unset: { y: '', z: '' } })
  })

  it('when a property is $min', function () {
    var obj = { x: 1, y: op.$min(10) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $min: { y: 10 } })
  })

  it('when more properties are $min', function () {
    var obj = { x: 1, y: op.$min(-1), z: op.$min('abc') }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $min: { y: -1, z: 'abc' } })
  })

  it('when a property is $max', function () {
    var obj = { x: 1, y: op.$max(10) }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $max: { y: 10 } })
  })

  it('when more properties are $max', function () {
    var obj = { x: 1, y: op.$max(-1), z: op.$max('abc') }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $max: { y: -1, z: 'abc' } })
  })

  it('when a property is $currentDate', function () {
    var obj = { x: 1, y: op.$currentDate() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $currentDate: { y: { $type: 'date' } } })
  })

  it('when more properties are $max', function () {
    var obj = { x: 1, y: op.$currentDate(), z: op.$currentDate() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $currentDate: { y: {$type: 'date'}, z: {$type: 'date'} } })
  })

  it('when a property is $timestamp', function () {
    var obj = { x: 1, y: op.$timestamp() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $timestamp: { y: { $type: 'timestamp' } } })
  })

  it('when more properties are $timestamp', function () {
    var obj = { x: 1, y: op.$timestamp(), z: op.$timestamp() }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1 }, $timestamp: { y: { $type: 'timestamp' }, z: { $type: 'timestamp' } } })
  })

  it('when a property is null', function () {
    var obj = { x: 1, y: null }
    expect(dot.flatten(obj)).to.deep
      .equal({ $set: { x: 1,  y: null } })
  })

  it('when uses all operators', function () {
    var obj = {
      a1: 1, a2: 11,
      b1: op.$inc(2), b2: op.$inc(22),
      c1: op.$mul(3), c2: op.$mul(33),
      d1: op.$rename('alias 4'), d2: op.$rename('alias 44'),
      e1: op.$setOnInsert([5]), e2: op.$setOnInsert([5, 5]),
      f1: op.$set(new Date(2000, 1, 1)), f2: op.$set(new Date(2016, 1, 1)),
      g1: op.$unset(), g2: op.$unset(),
      h1: op.$min(8), h2: op.$min(88),
      i1: op.$max(9), i2: op.$max(99),
      j1: op.$currentDate(), j2: op.$currentDate(),
      k1: op.$timestamp(), k2: op.$timestamp()
    }

    var expectedValue = {
      $set: { a1: 1, a2: 11, f1: new Date(2000, 1, 1), f2: new Date(2016, 1, 1) },
      $inc: { b1: 2, b2: 22 },
      $mul: { c1: 3, c2: 33 },
      $rename: { d1: 'alias 4', d2: 'alias 44' },
      $setOnInsert: { e1: [5], e2: [5, 5] },
      $unset: { g1: '', g2: '' },
      $min: { h1: 8, h2: 88 },
      $max: { i1: 9, i2: 99 },
      $currentDate: { j1: { $type: 'date' }, j2: { $type: 'date' } },
      $timestamp: { k1: { $type: 'timestamp' }, k2: { $type: 'timestamp' } },
    }
    expect(dot.flatten(obj)).to.deep
      .equal(expectedValue)
  })
})

describe('#complex scenarios', function () {
  it('when has inner property', function () {
    var obj = { a: {b: {c: 1}} }
    expect(dot.flatten(obj)).to.deep
      .equal({$set: {'a.b.c': 1}})
  })

  it('when has many inner properties', function () {
    var obj = {
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
    }

    var expectedValue = {
      $set: {
        'a.b.c': 1,
        'a.b.d': 2,
        'a.b.x.y.z': [1],
        x: 'test'
      }
    }

    expect(dot.flatten(obj)).to.deep
      .equal(expectedValue)
  })

  it('when has many inner properties with operators', function () {
    var id = new ObjectID()
	var obj = {
	  id: id,
      a: {
        b: {
          c: op.$min(1),
          d: 2,
          x: {
            y: {
              z: op.$inc(3),
              w: op.$min(100)
            },
            t: op.$mul(5)
          }
        }
      },
      n: op.$set({a: {b: {c: 'd'}}}),
      x: op.$rename('test')
    }

    var expectedValue = {
      $set: {
		'id': id,
        'a.b.d': 2,
        'n': { a: { b: { c: 'd' } } }
      },
      $min: { 'a.b.c': 1, 'a.b.x.y.w': 100 },
      $inc: { 'a.b.x.y.z': 3 },
      $mul: { 'a.b.x.t': 5 },
      $rename: { 'x': 'test' }
    }

    expect(dot.flatten(obj)).to.deep
      .equal(expectedValue)
  })
})
