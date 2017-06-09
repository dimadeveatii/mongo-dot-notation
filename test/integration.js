'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var MongoTimestamp = mongodb.Timestamp;
var MongoUrl = 'mongodb://localhost:27017/integration';

var expect = require('chai').expect;
var $ = require('../index');

describe('# Integration tests', function() {
  var db;
  
  before(function(done){
    MongoClient.connect(MongoUrl)
      .then(function(x){
        db = x;
        done();
      });
  });
  
  after(function(){ return db.close(); });
  
  describe('# Fields operators', function() {
    var collection;
    var searchCriteria = { email: 'john.doe@test.com' };
    var getUser = function(){ return collection.findOne(searchCriteria); }
    
    before(function(){ collection = db.collection('users'); });

    beforeEach(function(){
      return collection.insertOne({
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john.doe@test.com',
        'age': 30,
        'address': {
          'country': 'USA',
          'city': 'NY',
          'postCode': 'AB1234'
        }
      });
    });

    afterEach(function(){ return collection.remove(); });

    it('Update name', function() {
      return collection.update(searchCriteria, $.flatten({ 'firstName': 'Jack' }))
        .then(getUser)
        .then(function(x){
          return expect(x).to.have.property('firstName').that.equals('Jack');
        });
    });

    it('Update name to null', function () {
      return collection.update(searchCriteria, $.flatten({ 'firstName': null }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('firstName').that.is.null; });
    });

    it('Update address city', function () {
      return collection.update(searchCriteria, $.flatten({ 'address': { 'city': 'Boston' } }))
        .then(getUser)
        .then(function(x){ return expect(x.address).to.have.property('city').that.equals('Boston'); });
    });

    it('Add new `number` property to address', function () {
      return collection.update(searchCriteria, $.flatten({ 'address': { 'number': 9 } }))
        .then(getUser)
        .then(function(x){ expect(x.address).to.have.property('number').that.equals(9); });
    });

    it('Increment age with default value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$inc() }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(31); });
    });

    it('Increment age with 5', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$inc(5) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(35); });
    });

    it('Multiply age with default value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$mul() }))
        .then(getUser)
        .then(function(x){ expect(x).to.have.property('age').that.equals(30); });
    });

    it('Multiply age by two', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$mul(2) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(60); });
    });

    it('Rename firstName to first_name', function () {
      return collection.update(searchCriteria, $.flatten({ firstName: $.$rename('first_name') }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('first_name').that.equals('John'); });
    });

    it('Unset lastName', function () {
      return collection.update(searchCriteria, $.flatten({ lastName: $.$unset() }))
        .then(getUser)
        .then(function(x){ return expect(x).to.not.have.property('lastName'); });
    });

    it('Update age to min when less than current value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$min(27) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(27); });
    });

    it('Update age to min when greater than current value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$min(47) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(30); });
    });

    it('Update age to max when less than current value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$max(27) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(30); });
    });

    it('Update age to max when greater than current value', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$max(47) }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('age').that.equals(47); });
    });

    it('Set `updatedOn` to current date', function () {
      return collection.update(searchCriteria, $.flatten({ updatedOn: $.$currentDate() }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('updatedOn').that.respondTo('getTime'); });
    });

    it('Set `time` to current timestamp', function () {
      return collection.update(searchCriteria, $.flatten({ time: $.$timestamp() }))
        .then(getUser)
        .then(function(x){ return expect(x).to.have.property('time').that.is.instanceOf(MongoTimestamp); });
    });

    it('Update `pass` with SetOnInsert', function () {
      return collection.update(searchCriteria, $.flatten({ pass: $.$setOnInsert('change-me-next-time') }))
        .then(getUser)
        .then(function(x){ return expect(x).to.not.have.property('pass'); });
    });

    it('Insert `pass` with SetOnInsert', function () {
      var criteria = {email: 'test@test.com'};
      var value = 'change-me-next-time';
      return collection.update(criteria, $.flatten({ pass: $.$setOnInsert(value) }), {upsert: true})
        .then(function(){ return collection.findOne(criteria); })
        .then(function(x){ return expect(x).to.have.property('pass').that.equals(value); });
    });
  });
  
  describe('# Array operators', function(){
    //{ _id: 1, scores: [ 0, 2, 5, 5, 1, 0 ] }
    var collection;
    var searchCriteria = { _id: 1 };
    var getUser = function(){ return collection.findOne(searchCriteria); }

    before(function(){ collection = db.collection('users'); });
    beforeEach(function(){ return collection.insertOne({ _id: 1, scores: [ 0, 2, 5, 5, 1, 0 ] }); });
    afterEach(function(){ return collection.remove(); });

    it('Increment value position found', function(){
      return collection.update({ _id: 1, scores: {'$lt': 2} }, $.flatten({ scores: $.$().$inc(10) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.include(10, 2, 5, 5, 11, 10).and.have.lengthOf(6); });
    });

    it('Unset value position found', function(){
      return collection.update({ _id: 1, scores: {'$eq': 0} }, $.flatten({ scores: $.$().$unset() }))
        .then(getUser)
        .then(function(x){ return x.scores.should.include(null, 2, 5, 5, 1, null).and.have.lengthOf(6); });
    });

    it('Set field value position found', function(){
      return collection.remove()
        .then(function(){ 
          collection.insertOne({
            _id: 1,
            grades: [
              { grade: 80, mean: 75, std: 8 },
              { grade: 85, mean: 90, std: 5 },
              { grade: 90, mean: 85, std: 3 }
            ]
          }); 
        })
        .then(function(){ return collection.update({_id: 1, 'grades.grade': 85 }, $.flatten({ grades: $.$('std').$set(6) })); })
        .then(function(){ return collection.findOne({_id: 1, 'grades.grade': 85 }); })
        .then(function(x){ 
          return x.grades.should.deep.equal([
            { grade: 80, mean: 75, std: 8 },
            { grade: 85, mean: 90, std: 6 },
            { grade: 90, mean: 85, std: 3 }
          ]); 
        });
    });

    it('Add new element to set', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$addToSet(9) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.include(9).and.have.lengthOf(7); });
    });
    
    it('Add existing element to set', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$addToSet(2) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.include(2).and.have.lengthOf(6); });
    });
    
    it('Add array elements each', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$addToSet([2, 9]).$each() }))
        .then(getUser)
        .then(function(x){ return x.scores.should.include(9).and.have.lengthOf(7); });
    });
    
    it('Pop first element', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pop().first() }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([2, 5, 5, 1, 0]).and.have.lengthOf(5); });
    });
    
    it('Pop last element', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pop().last() }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 2, 5, 5, 1]).and.have.lengthOf(5); });
    });
    
    it('Pull all values of 5', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pullAll(5) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 2, 1, 0]).and.have.lengthOf(4); });
    });
    
    it('Pull all existing values', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pullAll([ 0, 2, 5, 5, 1, 0 ]) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.have.lengthOf(0); });
    });
    
    it('Pull value 5', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pull(5) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 2, 1, 0]).and.have.lengthOf(4); });
    });
    
    it('Pull values gte 2', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pull({$gte: 2}) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 1, 0]).and.have.lengthOf(3); });
    });
    
    it('Pull an array of values', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pull([0, 1]) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([2, 5, 5]).and.have.lengthOf(3); });
    });
    
    it('Push all values [2, 3]', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$pushAll([2, 3]) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 2, 5, 5, 1, 0, 2, 3]).and.have.lengthOf(8); });
    });
    
    it('Push 9', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push(9) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 2, 5, 5, 1, 0, 9]).and.have.lengthOf(7); });
    });
    
    it('Push 9 at 0-position', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push(9).$each().$position(0) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([9, 0, 2, 5, 5, 1, 0]).and.have.lengthOf(7); });
    });
    
    it('Push 9 and slice last 3 values', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push(9).$each().$slice(-3) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([1, 0, 9]).and.have.lengthOf(3); });
    });
    
    it('Push 9 and sort ASC', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push(9).$each().$sort() }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 0, 1, 2, 5, 5, 9]).and.have.lengthOf(7); });
    });
    
    it('Push 9 and sort DESC', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push(9).$each().$sort(-1) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([9, 5, 5, 2, 1, 0, 0]).and.have.lengthOf(7); });
    });
    
    it('Push [9, 99], sort ASC and slice last 3', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$sort().$slice(-3) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([5, 9, 99]).and.have.lengthOf(3); });
    });
    
    it('Push [9, 99], sort ASC and slice first 3', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$sort().$slice(3) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 0, 1]).and.have.lengthOf(3); });
    });
    
    it('Push [9, 99], at position 1 and slice first 3', function () {
      return collection.update(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$position(1).$slice(3) }))
        .then(getUser)
        .then(function(x){ return x.scores.should.deep.equal([0, 9, 99]).and.have.lengthOf(3); });
    });
  });
  
  describe('# Bitwise operators', function(){
    var collection;
    var searchCriteria = { map: 'NY' };
    var getPoint = function(){ return collection.findOne(searchCriteria); }

    before(function(){ collection = db.collection('users'); });
    beforeEach(function(){ return collection.insertOne({ map: 'NY', value: 11 }); });
    afterEach(function(){ return collection.remove(); });
    
    it('Perform bitwise AND operation 11 & 7 = 1011 & 0111 = 0011 = 3', function () {
      return collection.update(searchCriteria, $.flatten({ value: $.$and(7) }))
        .then(getPoint)
        .then(function(x){ return x.value.should.equal(3); });
    });
    
    it('Perform bitwise OR operation 11 | 7 = 1011 & 0111 = 1111 = 15', function () {
      return collection.update(searchCriteria, $.flatten({ value: $.$or(7) }))
        .then(getPoint)
        .then(function(x){ return x.value.should.equal(15); });
    });
    
    it('Perform bitwise XOR operation 11 | 7 = 1011 & 0111 = 1100 = 12', function () {
      return collection.update(searchCriteria, $.flatten({ value: $.$xor(7) }))
        .then(getPoint)
        .then(function(x){ return x.value.should.equal(12); });
    });
  });
});