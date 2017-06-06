'use strict'

var MongoClient = require('mongodb').MongoClient;
var MongoTimestamp = require('mongodb').Timestamp
var MongoUrl = 'mongodb://localhost:27017/integration';

var expect = require('chai').expect;
var $ = require('../index');

describe('# Integration tests', function() {
  describe('Fields operators', function() {
    var db;
    var collection;
    var searchCriteria = { email: 'john.doe@test.com' };

    before(function(done){
      MongoClient.connect(MongoUrl)
        .then(function(x){
          db = x;
          collection = db.collection('users');
          done();
        })
    })

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
      })
    })

    afterEach(function(){ return collection.remove(); })

    after(function(){ return db.close(); })

    it('Updates name', function() {
      return collection.update(searchCriteria, $.flatten({ 'firstName': 'Jack' }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){
          return expect(x).to.have.property('firstName').that.equals('Jack');
        });
    })

    it('Updates name to null', function () {
      return collection.update(searchCriteria, $.flatten({ 'firstName': null }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('firstName').that.is.null; });
    })

    it('updates address city', function () {
      return collection.update(searchCriteria, $.flatten({ 'address': { 'city': 'Boston' } }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x.address).to.have.property('city').that.equals('Boston'); });
    })

    it('adds new address property: number', function () {
      return collection.update(searchCriteria, $.flatten({ 'address': { 'number': 9 } }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ expect(x.address).to.have.property('number').that.equals(9); });
    })

    it('increments age by default with one', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$inc() }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(31); });
    })

    it('increments age by 5', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$inc(5) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(35) });
    })

    it('multiply age by default with one', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$mul() }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ expect(x).to.have.property('age').that.equals(30); });
    })

    it('multiply age by two', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$mul(2) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(60); });
    })

    it('rename firstName to first_name', function () {
      return collection.update(searchCriteria, $.flatten({ firstName: $.$rename('first_name') }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('first_name').that.equals('John'); });
    })

    it('unset lastName', function () {
      return collection.update(searchCriteria, $.flatten({ lastName: $.$unset() }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.not.have.property('lastName'); });
    })

    it('min when less then', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$min(27) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(27); });
    })

    it('min when greater then', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$min(47) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(30); });
    })

    it('max when less then', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$max(27) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(30); });
    })

    it('max when greater then', function () {
      return collection.update(searchCriteria, $.flatten({ age: $.$max(47) }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('age').that.equals(47) });
    })

    it('sets current date', function () {
      return collection.update(searchCriteria, $.flatten({ updatedOn: $.$currentDate() }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('updatedOn').that.respondTo('getTime'); });
    })

    it('sets current timestamp', function () {
      return collection.update(searchCriteria, $.flatten({ time: $.$timestamp() }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.have.property('time').that.is.instanceOf(MongoTimestamp) });
    })

    it('setOnInsert when updated results in no changes', function () {
      return collection.update(searchCriteria, $.flatten({ pass: $.$setOnInsert('change-me-next-time') }))
        .then(function(){ return collection.findOne(searchCriteria); })
        .then(function(x){ return expect(x).to.not.have.property('pass'); })
    })

    it('setOnInsert when inserted results in no changes', function () {
      var criteria = {email: 'test@test.com'};
      return collection.update(criteria, $.flatten({ pass: $.$setOnInsert('change-me-next-time') }), {upsert: true})
        .then(() => collection.findOne(criteria))
        .then(function(x){ return expect(x).to.have.property('pass').that.equals('change-me-next-time'); })
    })
  })
})