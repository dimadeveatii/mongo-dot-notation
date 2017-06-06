'use strict';

var should = require('chai').should();
var $ = require('../index');

describe('# Update operators', function () {
  describe('$inc', function () {
    it('When argument is undefined defaults to 1', function () {
      $.$inc().value().should.equal(1);
    });

    it('When argument is set uses its value', function () {
      var value = 123;
      $.$inc(value).value().should.equal(value);
    });
  });

  describe('$mul', function () {
    it('When argument is undefined defaults to 1', function () {
      $.$mul().value().should.equal(1);
    });

    it('When argument is set uses its value', function () {
      var value = 10;
      $.$mul(value).value().should.equal(value);
    });
  });

  describe('$rename', function(){
    it('Has expected value', function () {
      var value = 'test';
      $.$rename(value).value().should.equal(value);
    });
  });

  describe('$setOnInsert', function(){
    it('Has expected value', function () {
      var value = {x: 10, y: 20};
      $.$setOnInsert(value).value().should.equal(value);
    });
  });

  describe('$set', function(){
    it('Has expected value', function () {
      var value = { x: 10, y: 20 };
      $.$set(value).value().should.equal(value);
    });
  });

  describe('$unset', function(){
    it('Has empty string value', function () {
      $.$unset().value().should.equal('');
    });
  });

  describe('$min', function(){
    it('Has expected value', function () {
      var value = 10;
      $.$min(value).value().should.equal(value);
    });
  });

  describe('$max', function(){
    it('Has expected value', function () {
      var value = 10;
      $.$max(value).value().should.equal(value);
    });
  });

  describe('$currentDate', function(){
    it('When argument is undefined defaults to date type', function () {
      $.$currentDate().value().should.be.deep.equal({ $type: 'date' });
    });

    it('When argument is set uses its value', function () {
      $.$currentDate('timestamp').value()
        .should.be.deep.equal({ $type: 'timestamp' });
    });
  });

  describe('$timestamp', function(){
    it('Has timestamp type value', function () {
      $.$timestamp().value().should.be.deep.equal({ $type: 'timestamp' });
    });
  });
});