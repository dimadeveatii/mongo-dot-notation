'use strict'

const MongoClient = require('mongodb').MongoClient;
const MongoTimestamp = require('mongodb').Timestamp
const MongoUrl = 'mongodb://localhost:27017/integration';

var expect = require('chai').expect
var dot = require('../index')
var flatten = dot.flatten
var $ = dot.Operators

describe('#integration tests', function() {
  describe('simple cases', function() {
      var db;
      var collection;

      var searchCriteria = { email: 'john.doe@test.com' }

      before(() => MongoClient.connect(MongoUrl)
          .then(x => {
              db = x
              collection = db.collection('users')
          }))

      beforeEach(() => collection.insertOne({
          'firstName': 'John',
          'lastName': 'Doe',
          'email': 'john.doe@test.com',
          'age': 30,
          'address': {
              'country': 'USA',
              'city': 'NY',
              'postCode': 'AB1234'
          }
      }))
      afterEach(() => collection.remove())

      after(() => db.close())

      it('updates name', function() {
          return collection.update(searchCriteria, flatten({ 'firstName': 'Jack' }))
            .then(() => collection.findOne(searchCriteria))
            .then(x => expect(x).to.have.property('firstName').that.equals('Jack'))
      })

      it('updates name to null', function () {
          return collection.update(searchCriteria, flatten({ 'firstName': null }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('firstName').that.is.null)
      })

      it('updates address city', function () {
          return collection.update(searchCriteria, flatten({ 'address': { 'city': 'Boston' } }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x.address).to.have.property('city').that.equals('Boston'))
      })

      it('adds new address property: number', function () {
          return collection.update(searchCriteria, flatten({ 'address': { 'number': 9 } }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x.address).to.have.property('number').that.equals(9))
      })

      it('increments age by default with one', function () {
          return collection.update(searchCriteria, flatten({ age: $.$inc() }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(31))
      })

      it('increments age by 5', function () {
          return collection.update(searchCriteria, flatten({ age: $.$inc(5) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(35))
      })

      it('multiply age by default with one', function () {
          return collection.update(searchCriteria, flatten({ age: $.$mul() }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(30))
      })

      it('multiply age by two', function () {
          return collection.update(searchCriteria, flatten({ age: $.$mul(2) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(60))
      })

      it('rename firstName to first_name', function () {
          return collection.update(searchCriteria, flatten({ firstName: $.$rename('first_name') }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('first_name').that.equals('John'))
      })

      it('unset lastName', function () {
          return collection.update(searchCriteria, flatten({ lastName: $.$unset() }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.not.have.property('lastName'))
      })

      it('min when less then', function () {
          return collection.update(searchCriteria, flatten({ age: $.$min(27) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(27))
      })

      it('min when greater then', function () {
          return collection.update(searchCriteria, flatten({ age: $.$min(47) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(30))
      })

      it('max when less then', function () {
          return collection.update(searchCriteria, flatten({ age: $.$max(27) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(30))
      })

      it('max when greater then', function () {
          return collection.update(searchCriteria, flatten({ age: $.$max(47) }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('age').that.equals(47))
      })

      it('sets current date', function () {
          return collection.update(searchCriteria, flatten({ updatedOn: $.$currentDate() }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => expect(x).to.have.property('updatedOn').that.respondTo('getTime'))
      })

      it('sets current timestamp', function () {
          return collection.update(searchCriteria, flatten({ time: $.$timestamp() }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => {
                  expect(x).to.have.property('time').that.is.instanceOf(MongoTimestamp)
              })
      })

      it('setOnInsert when updated results in no changes', function () {
          return collection.update(searchCriteria, flatten({ pass: $.$setOnInsert('change-me-next-time') }))
              .then(() => collection.findOne(searchCriteria))
              .then(x => {
                  expect(x).to.not.have.property('pass')
              })
      })

      it('setOnInsert when inserted results in no changes', function () {
          const criteria = {email: 'test@test.com'};
          return collection.update(criteria, flatten({ pass: $.$setOnInsert('change-me-next-time') }), {upsert: true})
              .then(() => collection.findOne(criteria))
              .then(x => {
                  expect(x).to.have.property('pass').that.equals('change-me-next-time')
              })
      })
  })
})