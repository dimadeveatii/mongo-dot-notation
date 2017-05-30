'use strict'

var should = require('chai').should();
var $ = require('../index');

describe('# Update operators', function () {
  describe('$inc', function () {
    it('When argument is undefined defaults to 1', function () {
      $.$inc().value().should.equal(1)
    })

    it('When argument is set uses its value', function () {
      var value = 123
      $.$inc(value).value().should.equal(value)
    })
  })

  describe('$mul', function () {
    it('When argument is undefined defaults to 1', function () {
      $.$mul().value().should.equal(1)
    })

    it('When argument is set uses its value', function () {
      var value = 10
      $.$mul(value).value().should.equal(value)
    })
  })

  describe('$rename', function(){
	  it('Has expected value', function () {
		var alias = 'test'
		$.$rename(alias).value().should.equal(alias)
	  })
  })

  describe('$setOnInsert', function(){
	it('Has expected value', function () {
		var obj = {x: 10, y: 20}
		$.$setOnInsert(obj).value().should.equal(obj)
	  })  
  })

  describe('$set', function(){
	it('Has expected value', function () {
		var obj = { x: 10, y: 20 }
		$.$set(obj).value().should.equal(obj)
	  })
  })
  
  describe('$unset', function(){
	it('Has empty string value', function () {
		$.$unset().value().should.equal('')
	  })
  })

  describe('$min', function(){
	it('Has expected value', function () {
		var value = 10
		$.$min(value).value().should.equal(value)
	})
  })

  describe('$max', function(){
	it('$max returns correct value', function () {
		var value = 10
		$.$max(value).value().should.equal(value)
	  })
  })
  
  describe('$currentDate', function(){
	it('When argument is undefined defaults to date type', function () {
		$.$currentDate().value().should.be.deep.equal({ $type: 'date' })
	  })

	 it('When argument is set uses its value', function () {
		$.$currentDate('timestamp').value().should.be.deep.equal({ $type: 'timestamp' })
	  })
  })
  
  describe('$timestamp', function(){
	it('Has timestamp type value', function () {
		$.$timestamp().value().should.be.deep.equal({ $type: 'timestamp' })
	  })  
  })
})