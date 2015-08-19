'use strict'

var should = require('chai').should()
var expect = require('chai').expect
var dot = require('../index')

describe('#update opeators', function () {
  describe('$inc', function () {
    it('defaults to 1', function () {
      var $inc = dot.Operators.$inc()
      $inc.value().should.equal(1)
    })
    
    it('returns 1 when isNaN', function () {
      var $inc = dot.Operators.$inc('abc')
      $inc.value().should.equal(1)
    })

    it('returns correct value', function () {
      var value = 123
      var $inc = dot.Operators.$inc(value)
      $inc.value().should.equal(value)
    })
  })

  describe('$mul', function () {
    it('defaults to 1', function () {
      var $mul = dot.Operators.$mul()
      $mul.value().should.equal(1)
    })

    it('returns 1 when isNaN', function () {
      var $mul = dot.Operators.$mul('abc')
      $mul.value().should.equal(1)
    })

    it('returns correct value', function () {
      var value = 10
      var $mul = dot.Operators.$mul(value)
      $mul.value().should.equal(value)
    })
  })

  it('$rename returns correct value', function () {
    var alias = 'test'
    var $rename = dot.Operators.$rename(alias)
    $rename.value().should.equal(alias)
  })

  it('$setOnInsert returns correct value', function () {
    var obj = {x: 10, y: 20}
    var $setOnInsert = dot.Operators.$setOnInsert(obj)
    $setOnInsert.value().should.equal(obj)
  })

  it('$set returns correct value', function () {
    var obj = { x: 10, y: 20 }
    var $set = dot.Operators.$set(obj)
    $set.value().should.equal(obj)
  })

  it('$unset returns empty value', function () {
    var $unset = dot.Operators.$unset()
    expect($unset.value()).to.equal('')
  })

  it('$min returns correct value', function () {
    var value = 10
    var $min = dot.Operators.$min(value)
    $min.value().should.equal(value)
  })

  it('$max returns correct value', function () {
    var value = 10
    var $max = dot.Operators.$max(value)
    $max.value().should.equal(value)
  })

  it('$currentDate returns date type value', function () {
    var $currentDate = dot.Operators.$currentDate()
    expect($currentDate.value()).to.be.deep.equal({ $type: 'date' })
  })

  it('$timestamp returns timestamp type value', function () {
    var $timestamp = dot.Operators.$timestamp()
    expect($timestamp.value()).to.be.deep.equal({ $type: 'timestamp' })
  })
})