'use strict';

var should = require('chai').should();
var expect = require('chai').expect;
var $ = require('../index');
var Operator = require('../lib/operator');

describe('# Internals', function(){
  describe('# Operator', function(){
    it('Defines isOperator methos', function(){
      Operator.should.itself.respondTo('isOperator');
    });

    it('When null name throws', function(){
      expect(function(){ new Operator(); }).to.throw();
    });

    it('Name is set', function(){
      new Operator('inc').should.have.property('name').
        that.equals('inc');
    });

    it('When value not set defaults to undefined', function(){
      expect(new Operator('test').value()).to.be.undefined;
    });

    it('When value set to null returns null value', function(){
      expect(new Operator('test').value(null).value()).to.be.null;
    });

    it('When value set returns same value', function(){
      var val = {};
      new Operator('test').value(val).value().should.equal(val);
    });

    it('When value set chains self', function(){
      var op = new Operator('test');
      op.value({}).should.equal(op);
    });
  });
});

describe('# Update operators', function () {
  describe('# Field', function(){

    describe('$inc', function () {
      it('Is operator', function () {
        $.isOperator($.$inc()).should.be.true;
      });
      
      it('Has $inc name', function () {
        $.$inc().name.should.equal('$inc');
      });
      
      it('When argument is undefined defaults to 1', function () {
        $.$inc().value().should.equal(1);
      });

      it('When argument is set uses its value', function () {
        var value = 123;
        $.$inc(value).value().should.equal(value);
      });
    });

    describe('$mul', function () {
      it('Is operator', function () {
        $.isOperator($.$mul()).should.be.true;
      });
      
      it('Has $mul name', function () {
        $.$mul().name.should.equal('$mul');
      });
      
      it('When argument is undefined defaults to 1', function () {
        $.$mul().value().should.equal(1);
      });

      it('When argument is set uses its value', function () {
        var value = 10;
        $.$mul(value).value().should.equal(value);
      });
    });

    describe('$rename', function(){
      it('Is operator', function () {
        $.isOperator($.$rename('field')).should.be.true;
      });
      
      it('Has $rename name', function () {
        $.$rename('field').name.should.equal('$rename');
      });
      
      it('Has expected value', function () {
        var value = 'test';
        $.$rename(value).value().should.equal(value);
      });
    });

    describe('$setOnInsert', function(){
      it('Is operator', function () {
        $.isOperator($.$setOnInsert(1)).should.be.true;
      });
      
      it('Has $setOnInsert name', function () {
        $.$setOnInsert(10).name.should.equal('$setOnInsert');
      });

      it('Has expected value', function () {
        var value = {x: 10, y: 20};
        $.$setOnInsert(value).value().should.equal(value);
      });
    });

    describe('$set', function(){
      it('Is operator', function () {
        $.isOperator($.$set(1)).should.be.true;
      });
      
      it('Has $set name', function () {
        $.$set(10).name.should.equal('$set');
      });
      
      it('Has expected value', function () {
        var value = { x: 10, y: 20 };
        $.$set(value).value().should.equal(value);
      });
    });

    describe('$unset', function(){
      it('Is operator', function () {
        $.isOperator($.$unset()).should.be.true;
      });
      
      it('Has $unset name', function () {
        $.$unset().name.should.equal('$unset');
      });
      
      it('Has empty string value', function () {
        $.$unset().value().should.equal('');
      });
    });

    describe('$min', function(){
      it('Is operator', function () {
        $.isOperator($.$min(1)).should.be.true;
      });
      
      it('Has $min name', function () {
        $.$min(1).name.should.equal('$min');
      });
      
      it('Has expected value', function () {
        var value = 10;
        $.$min(value).value().should.equal(value);
      });
    });

    describe('$max', function(){
      it('Is operator', function () {
        $.isOperator($.$max(1)).should.be.true;
      });
      
      it('Has $max name', function () {
        $.$max(1).name.should.equal('$max');
      });
      
      it('Has expected value', function () {
        var value = 10;
        $.$max(value).value().should.equal(value);
      });
    });

    describe('$currentDate', function(){
      it('Is operator', function () {
        $.isOperator($.$currentDate()).should.be.true;
      });
      
      it('Has $currentDate name', function () {
        $.$currentDate().name.should.equal('$currentDate');
      });
      
      it('When argument is undefined defaults to date type', function () {
        $.$currentDate().value().should.be.deep.equal({ $type: 'date' });
      });

      it('When argument is set uses its value', function () {
        $.$currentDate('timestamp').value()
          .should.be.deep.equal({ $type: 'timestamp' });
      });
    });

    describe('$timestamp *', function(){
      it('Is operator', function () {
        $.isOperator($.$timestamp()).should.be.true;
      });
      
      it('Has $currentDate name', function () {
        $.$timestamp().name.should.equal('$currentDate');
      });
      
      it('Has timestamp type value', function () {
        $.$timestamp().value().should.be.deep.equal({ $type: 'timestamp' });
      });
    });
  });
  
  describe('# Array', function(){
    describe('$', function(){
      it('Is operator', function () {
        $.isOperator($.$()).should.be.true;
      });
      
      it('Has $ name when no field specified', function(){
        $.$().name.should.equal('$');
      });
      
      it('Appends field to name when field specified', function(){
        $.$('std').name.should.equal('$.std');
      });
      
      it('Appends index when number specified', function(){
        $.$(3).name.should.equal('3');
      });

      it('Appends index when string number specified', function(){
        $.$('3').name.should.equal('3');
      });

      it('Appends index with field when mathes number', function(){
        $.$('3.std').name.should.equal('3.std');
      });

      it('Appends index with field when mathes 0', function(){
        $.$('0.std').name.should.equal('0.std');
      });

      it('Value throws when not set', function(){
        expect(function(){ $.$().value(); }).to.throw();
      });
      
      it('Value throws when not supported operator is set', function(){
        expect(function(){ $.$().value($.$setOnInsert(10)); }).to.throw(/setOnInsert/);
      });
      
      it('When value set defaults to $set', function(){
        $.$().value(101).value().value().should.equal(101);
      });
      
      it('When value set with $set with null', function(){
        expect($.$().value($.$set(null)).value().value()).to.be.null;
      });
      
      it('When value set to null', function(){
        var operator = $.$unset();
        expect($.$().value($.$set(null)).value().value()).to.be.null;
      });
      
      it('When value set with operator returns operator', function(){
        var operator = $.$unset();
        $.$().value(operator).value().should.equal(operator);
      });
      
      it('When chained operator', function(){
        $.$().$inc(10).value().should.have.property('name').that.equals('$inc');
      });
      
      it('Is chainable with $inc', function(){
        $.$().should.respondTo('$inc');
      });
      
      it('Is chainable with $mul', function(){
        $.$().should.respondTo('$mul');
      });
      
      it('Is chainable with $set', function(){
        $.$().should.respondTo('$set');
      });
      
      it('Is chainable with $unset', function(){
        $.$().should.respondTo('$unset');
      });
      
      it('Is chainable with $min', function(){
        $.$().should.respondTo('$min');
      });
      
      it('Is chainable with $max', function(){
        $.$().should.respondTo('$max');
      });
      
      it('Is chainable with $currentDate', function(){
        $.$().should.respondTo('$currentDate');
      });
      
      it('Is chainable with $timestamp', function(){
        $.$().should.respondTo('$timestamp');
      });
    });
    
    describe('$addToSet', function(){
      it('Is operator', function () {
        $.isOperator($.$addToSet(1)).should.be.true;
      });
      
      it('Has $addToSet name', function () {
        $.$addToSet(1).name.should.equal('$addToSet');
      });
      
      it('When is null value', function () {
        expect($.$addToSet(null).value()).to.be.null;
      });
      
      it('When is scalar value', function () {
        var value = 10;
        $.$addToSet(value).value().should.equal(value);
      });

      it('When is null value with each', function () {
        $.$addToSet(null).$each().value().should.deep.equal({ '$each': [null] });
      });
      
      it('When is array value', function () {
        var value = [1, 2, 3];
        $.$addToSet(value).value().should.equal(value);
      });
      
      it('When is scalar value with each', function () {
        var value = 10;
        $.$addToSet(value).$each().value().should.deep.equal({ '$each': [10] });
      });
      
      it('When is array value with each', function () {
        var value = [1, 2, 3];
        $.$addToSet(value).$each().value().should.deep.equal({ '$each': [1, 2, 3] });
      });
    });
    
    describe('$pop', function(){
      it('Is operator', function () {
        $.isOperator($.$pop(1)).should.be.true;
      });
      
      it('Has $pop name', function () {
        $.$pop(1).name.should.equal('$pop');
      });
      
      it('When direction not specified uses 1 by default', function(){
        $.$pop().value().should.equal(1);
      });
      
      it('When direction is 1 uses 1', function(){
        $.$pop(1).value().should.equal(1);
      });
      
      it('When direction is -1 uses -1', function(){
        $.$pop(-1).value().should.equal(-1);
      });
      
      it('When chained with first uses -1', function(){
        $.$pop().first().value().should.equal(-1);
      });
      
      it('When chained with last uses 1', function(){
        $.$pop().last().value().should.equal(1);
      });
    });
    
    describe('$pullAll', function(){
      it('Is operator', function () {
        $.isOperator($.$pullAll(1)).should.be.true;
      });
      
      it('Has $pullAll name', function () {
        $.$pullAll(1).name.should.equal('$pullAll');
      });
      
      it('When null value specified returns array of null element', function(){
        $.$pullAll(null).value().should.deep.equal([null]);
      });
      
      it('When empty array specified returns empty array', function(){
        $.$pullAll([]).value().should.deep.equal([]);
      });
      
      it('When value specified returns array of value element', function(){
        var value = 'Test';
        $.$pullAll(value).value().should.deep.equal([value]);
      });
      
      
      it('When array specified returns array', function(){
        var value = [1, 2, 3];
        $.$pullAll(value).value().should.deep.equal(value);
      })
    });
    
    describe('$pull', function(){
      it('Is operator', function () {
        $.isOperator($.$pull(1)).should.be.true;
      });
      
      it('Has $pull name', function () {
        $.$pull(1).name.should.equal('$pull');
      });
      
      it('When null value specified returns null', function(){
        expect($.$pull(null).value()).to.equal(null);
      });
      
      it('When scalar value specified returns value', function(){
        var value = 100;
        $.$pull(value).value().should.to.equal(value);
      });
      
      it('When object value specified returns value', function(){
        var value = { score: 8, item: "B" };
        $.$pull(value).value().should.to.deep.equal(value);
      });
      
      it('When array value specified applies $in operator', function(){
        var value = ['A', 'B', 'C'];
        $.$pull(value).value().should.to.deep.equal({ '$in': value });
      });
    });
    
    describe('$pushAll', function(){
      it('Is operator', function () {
        $.isOperator($.$pushAll(1)).should.be.true;
      });
      
      it('Has $pushAll name', function () {
        $.$pushAll(1).name.should.equal('$pushAll');
      });
      
      it('When null value specified returns null', function(){
        expect($.$pushAll(null).value()).to.deep.equal([null]);
      });
      
      it('When scalar value specified returns array of value', function(){
        var value = 100;
        $.$pushAll(value).value().should.deep.equal([value]);
      });
      
      it('When object value specified returns array of value', function(){
        var value = { score: 8, item: 'B' };
        $.$pushAll(value).value().should.deep.equal([value]);
      });
      
      it('When array value specified returns array', function(){
        var value = ['A', 'B', 'C'];
        $.$pushAll(value).value().should.deep.equal(value);
      });
    });
    
    describe('$push', function(){
      it('Is operator', function () {
        $.isOperator($.$push(1)).should.be.true;
      });
      
      it('Has $push name', function(){
        $.$push().name.should.equal('$push');
      });
      
      it('When null value specified returns null', function(){
        expect($.$push(null).value()).to.equal(null);
      });
      
      it('When undefined value specified returns undefined', function(){
        expect($.$push().value()).to.equal(undefined);
      });

      it('When scalar value specified returns value', function(){
        var value = 9;
        $.$push(value).value().should.equal(value);
      });
      
      it('When object value specified returns value', function(){
        var value = { data: 'test'};
        $.$push(value).value().should.deep.equal(value);
      });
      
      it('When array value specified returns array', function(){
        var value = [1, 2, 3];
        $.$push(value).value().should.deep.equal(value);
      });
      
      it('When no value specified with $each', function(){
        $.$push().$each().value().should.deep.equal({ '$each': []});
      });
      
      it('When scalar value specified with $each', function(){
        var value = 100;
        $.$push(value).$each().value().should.deep.equal({ '$each': [value]});
      });
      
      it('When array value specified with $each', function(){
        var value = [1, 2, 3];
        $.$push(value).$each().value().should.deep.equal({ '$each': value});
      });
      
      it('When using $slice without $each throws', function(){
        expect(function(){ $.$push(10).$slice(1); }).to.throw(/\$slice/);
      });
      
      it('When using $slice with empty value is ignored', function(){
        $.$push(10).$each().$slice().value()
          .should.deep.equal({'$each': [10]});
      });
      
      it('When using $slice sets value', function(){
        $.$push(10).$each().$slice(-3).value()
          .should.deep.equal({'$each': [10], '$slice': -3});
      });
      
      it('When using $sort without $each throws', function(){
        expect(function(){ $.$push(10).$sort(1); }).to.throw(/\$sort/);
      });
      
      it('When using $sort with empty value uses 1 by default', function(){
        $.$push(10).$each().$sort().value()
          .should.deep.equal({'$each': [10], '$sort': 1});
      });
      
      it('When using $sort sets value', function(){
        $.$push(10).$each().$sort({ val: 1 }).value()
          .should.deep.equal({'$each': [10], '$sort': { val: 1}});
      });
      
      it('When using $position without $each throws', function(){
        expect(function(){ $.$push(10).$position(1); }).to.throw(/\$position/);
      });
      
      it('When using $position with empty value is ignored', function(){
        $.$push(10).$each().$position().value()
          .should.deep.equal({'$each': [10]});
      });
      
      it('When using $position sets value', function(){
        $.$push(10).$each().$position(0).value()
          .should.deep.equal({'$each': [10], '$position': 0});
      });
      
      it('When using $each, $slice, $sort and $position', function(){
        $.$push([{score: 9}, {score: 10}, {score: 7}])
          .$each()
          .$position(0)
          .$sort({score: -1})
          .$slice(3)
          .value()
          .should.deep.equal({
            '$each': [{score: 9}, {score: 10}, {score: 7}],
            '$sort': {score: -1},
            '$slice': 3,
            '$position': 0
          })
      });
    });
    
    describe('$slice *', function(){
      it('Is operator', function () {
        $.isOperator($.$slice(1)).should.be.true;
      });
      
      it('Has $push name', function(){
        $.$slice(1).name.should.equal('$push');
      });
      
      it('Is same as $push of empty array', function(){
        $.$slice(1).value().should.deep.equal({ '$each': [], '$slice': 1 });
      });
    });
    
    describe('$sort *', function(){
      it('Is operator', function () {
        $.isOperator($.$sort(1)).should.be.true;
      });
      
      it('Has $push name', function(){
        $.$sort(1).name.should.equal('$push');
      });
      
      it('Is same as $push of empty array', function(){
        $.$sort(1).value().should.deep.equal({ '$each': [], '$sort': 1 });
      });
    });
  });
  
  describe('# Bitwise', function(){
    describe('$bit', function(){
      it('Is operator', function () {
        $.isOperator($.$bit()).should.be.true;
      });
      
      it('Has $bit name', function(){
        $.$bit().name.should.equal('$bit');
      });
      
      it('Is chainable with $and', function(){
        $.$bit().should.respondTo('$and');
      });
      
      it('When chained with $and sets value', function(){
        $.$bit().$and(1).value().should.deep.equal({ 'and': 1 });
      });
      
      it('Is chainable with $or', function(){
        $.$bit().should.respondTo('$or');
      });
      
      it('When chained with $or sets value', function(){
        $.$bit().$or(1).value().should.deep.equal({ 'or': 1 });
      });
      
      it('Is chainable with $xor', function(){
        $.$bit().should.respondTo('$xor');
      });
      
      it('When chained with $or sets value', function(){
        $.$bit().$xor(1).value().should.deep.equal({ 'xor': 1 });
      });
      
      it('Value throws', function(){
        expect(function(){ $.$bit().value(); }).to.throw();
      });
    });
    
    describe('$and *', function(){
      it('Is operator', function () {
        $.isOperator($.$and(5)).should.be.true;
      });
      
      it('Has $bit name', function(){
        $.$and(5).name.should.equal('$bit');
      });
      
      it('When value provided', function(){
        $.$and(5).value().should.deep.equal({ 'and': 5 });
      });
    });
    
    describe('$or *', function(){
      it('Is operator', function () {
        $.isOperator($.$or(5)).should.be.true;
      });
      
      it('Has $bit name', function(){
        $.$or(5).name.should.equal('$bit');
      });
      
      it('When value provided', function(){
        $.$or(5).value().should.deep.equal({ 'or': 5 });
      });
    });
    
    describe('$xor *', function(){
      it('Is operator', function () {
        $.isOperator($.$xor(5)).should.be.true;
      });
      
      it('Has $bit name', function(){
        $.$xor(5).name.should.equal('$bit');
      });
      
      it('When value provided', function(){
        $.$xor(5).value().should.deep.equal({ 'xor': 5 });
      });
    });
  });
});