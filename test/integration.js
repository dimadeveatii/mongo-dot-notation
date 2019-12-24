'use strict';

const mongodb = require('mongodb');
const MongoUrl = 'mongodb://localhost:27017/integration';

const expect = require('chai').expect;
const $ = require('../index');

describe('# Integration tests', () => {
  let db;
  let client;
  
  before(async () => {
    client = await mongodb.MongoClient.connect(MongoUrl)
    db = client.db();
  });
  
  after(() => client.close());
  
  describe('# Fields operators', () => {
    let collection;

    async function getUpdatedUser(value) {
      const searchCriteria = { email: 'john.doe@test.com' };
      await collection.update(searchCriteria, value);
      return await collection.findOne(searchCriteria);
    };
  
    before(() => { collection = db.collection('users'); });

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
    }));

    afterEach(() => collection.remove());

    it('Update name', async () => {
      const user = await getUpdatedUser($.flatten({ 'firstName': 'Jack' }));
      expect(user).to.have.property('firstName').that.equals('Jack');
    });

    it('Update name to null', async () => {
      const user = await getUpdatedUser($.flatten({ 'firstName': null }));
      expect(user).to.have.property('firstName').that.is.null;
    });

    it('Update address city', async () => {
      const user = await getUpdatedUser($.flatten({ 'address': { 'city': 'Boston' } }));
      expect(user.address).to.have.property('city').that.equals('Boston');
    });

    it('Add new `number` property to address', async () => {
      const user = await getUpdatedUser($.flatten({ 'address': { 'number': 9 } }));
      expect(user.address).to.have.property('number').that.equals(9);
    });

    it('Increment age with default value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$inc() }));
      expect(user).to.have.property('age').that.equals(31);
    });

    it('Increment age with 5', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$inc(5) }));
      expect(user).to.have.property('age').that.equals(35);
    });

    it('Multiply age with default value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$mul() }));
      expect(user).to.have.property('age').that.equals(30);
    });

    it('Multiply age by two', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$mul(2) }));
      expect(user).to.have.property('age').that.equals(60);
    });

    it('Rename firstName to first_name', async () => {
      const user = await getUpdatedUser($.flatten({ firstName: $.$rename('first_name') }));
      expect(user).to.have.property('first_name').that.equals('John');
    });

    it('Unset lastName', async () => {
      const user = await getUpdatedUser($.flatten({ lastName: $.$unset() }));
      expect(user).to.not.have.property('lastName');
    });

    it('Update age to min when less than current value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$min(27) }));
      expect(user).to.have.property('age').that.equals(27);
    });

    it('Update age to min when greater than current value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$min(47) }));
      expect(user).to.have.property('age').that.equals(30);
    });

    it('Update age to max when less than current value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$max(27) }));
      expect(user).to.have.property('age').that.equals(30);
    });

    it('Update age to max when greater than current value', async () => {
      const user = await getUpdatedUser($.flatten({ age: $.$max(47) }));
      expect(user).to.have.property('age').that.equals(47);
    });

    it('Set `updatedOn` to current date', async () => {
      const user = await getUpdatedUser($.flatten({ updatedOn: $.$currentDate() }));
      expect(user).to.have.property('updatedOn').that.respondTo('getTime');
    });

    it('Set `time` to current timestamp', async () => {
      const user = await getUpdatedUser($.flatten({ time: $.$timestamp() }));
      expect(user).to.have.property('time').that.is.instanceOf(mongodb.Timestamp);
    });

    it('Update `pass` with SetOnInsert', async () => {
      const user = await getUpdatedUser($.flatten({ pass: $.$setOnInsert('change-me-next-time') }));
      expect(user).to.not.have.property('pass');
    });

    it('Insert `pass` with SetOnInsert', async () => {
      const criteria = {email: 'test@test.com'};
      const value = 'change-me-next-time';
      await collection.update(criteria, $.flatten({ pass: $.$setOnInsert(value) }), { upsert: true });
      const user = await collection.findOne(criteria);

      expect(user).to.have.property('pass').that.equals(value);
    });
  });

  describe('# Array operators', () => {
    let collection;
    const searchCriteria = { _id: 1 };

    async function getUpdatedUser(criteria, value) {
      const userCriteria = { _id: 1 };
      await collection.update(criteria, value);
      return await collection.findOne(userCriteria);
    };

    before(() => { collection = db.collection('users'); });
    beforeEach(() => collection.insertOne({ _id: 1, scores: [ 0, 2, 5, 5, 1, 0 ] }));
    afterEach(() => collection.remove());

    it('Increment value position found', async () => {
      const user = await getUpdatedUser({ _id: 1, scores: { '$lt': 2 } }, $.flatten({ scores: $.$().$inc(10) }));
      user.scores.should.include(10, 2, 5, 5, 11, 10).and.have.lengthOf(6);
    });

    it('Unset value position found', async () => {
      const user = await getUpdatedUser({ _id: 1, scores: {'$eq': 0} }, $.flatten({ scores: $.$().$unset() }));
      user.scores.should.include(null, 2, 5, 5, 1, null).and.have.lengthOf(6);
    });

    it('Set field value position found', async () => {
      await collection.remove();
      await collection.insertOne({
        _id: 1,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 }
        ]
      });

      await collection.update({ _id: 1, 'grades.grade': 85 }, $.flatten({ grades: $.$('std').$set(6) }));
      const user = await collection.findOne({_id: 1, 'grades.grade': 85 });

      user.grades.should.deep.equal([
        { grade: 80, mean: 75, std: 8 },
        { grade: 85, mean: 90, std: 6 },
        { grade: 90, mean: 85, std: 3 }
      ]);
    });

    it('Add new element to set', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$addToSet(9) }));
      user.scores.should.include(9).and.have.lengthOf(7);
    });
    
    it('Add existing element to set', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$addToSet(2) }));
      user.scores.should.include(2).and.have.lengthOf(6);
    });
    
    it('Add array elements each', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$addToSet([2, 9]).$each() }));
      user.scores.should.include(9).and.have.lengthOf(7);
    });
    
    it('Pop first element', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pop().first() }));
      user.scores.should.deep.equal([2, 5, 5, 1, 0]).and.have.lengthOf(5);
    });
    
    it('Pop last element', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pop().last() }));
      user.scores.should.deep.equal([0, 2, 5, 5, 1]).and.have.lengthOf(5);
    });
    
    it('Pull all values of 5', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pullAll(5) }));
      user.scores.should.deep.equal([0, 2, 1, 0]).and.have.lengthOf(4);
    });
    
    it('Pull all existing values', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pullAll([ 0, 2, 5, 5, 1, 0 ]) }));
      user.scores.should.have.lengthOf(0);
    });
    
    it('Pull value 5', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pull(5) }));
      user.scores.should.deep.equal([0, 2, 1, 0]).and.have.lengthOf(4);
    });
    
    it('Pull values gte 2', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pull({$gte: 2}) }));
      user.scores.should.deep.equal([0, 1, 0]).and.have.lengthOf(3);
    });
    
    it('Pull an array of values', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$pull([0, 1]) }));
      user.scores.should.deep.equal([2, 5, 5]).and.have.lengthOf(3);
    });
    
    it('Push 9', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push(9) }));
      user.scores.should.deep.equal([0, 2, 5, 5, 1, 0, 9]).and.have.lengthOf(7);
    });
    
    it('Push 9 at 0-position', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push(9).$each().$position(0) }));
      user.scores.should.deep.equal([9, 0, 2, 5, 5, 1, 0]).and.have.lengthOf(7);
    });
    
    it('Push 9 and slice last 3 values', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push(9).$each().$slice(-3) }));
      user.scores.should.deep.equal([1, 0, 9]).and.have.lengthOf(3);
    });
    
    it('Push 9 and sort ASC', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push(9).$each().$sort() }));
      user.scores.should.deep.equal([0, 0, 1, 2, 5, 5, 9]).and.have.lengthOf(7);
    });
    
    it('Push 9 and sort DESC', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push(9).$each().$sort(-1) }));
      user.scores.should.deep.equal([9, 5, 5, 2, 1, 0, 0]).and.have.lengthOf(7);
    });
    
    it('Push [9, 99], sort ASC and slice last 3', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$sort().$slice(-3) }));
      user.scores.should.deep.equal([5, 9, 99]).and.have.lengthOf(3);
    });
    
    it('Push [9, 99], sort ASC and slice first 3', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$sort().$slice(3) }));
      user.scores.should.deep.equal([0, 0, 1]).and.have.lengthOf(3);
    });
    
    it('Push [9, 99], at position 1 and slice first 3', async () => {
      const user = await getUpdatedUser(searchCriteria, $.flatten({ scores: $.$push([9, 99]).$each().$position(1).$slice(3) }));
      user.scores.should.deep.equal([0, 9, 99]).and.have.lengthOf(3);
    });
  });
  
  describe('# Bitwise operators', function(){
    let collection;
    const searchCriteria = { map: 'NY' };

    async function getUpdatedPoint(value) {
      await collection.update(searchCriteria, value);
      return await collection.findOne(searchCriteria);
    }

    before(() => { collection = db.collection('users'); });
    beforeEach(async () => collection.insertOne({ map: 'NY', value: 11 }));
    afterEach(async () => collection.remove());
    
    it('Perform bitwise AND operation 11 & 7 = 1011 & 0111 = 0011 = 3', async () => {
      const point = await getUpdatedPoint($.flatten({ value: $.$and(7) }));
      point.value.should.equal(3);
    });
    
    it('Perform bitwise OR operation 11 | 7 = 1011 & 0111 = 1111 = 15', async () => {
      const point = await getUpdatedPoint($.flatten({ value: $.$or(7) }));
      point.value.should.equal(15); 
    });
    
    it('Perform bitwise XOR operation 11 | 7 = 1011 & 0111 = 1100 = 12', async () => {
      const point = await getUpdatedPoint($.flatten({ value: $.$xor(7) }));
      point.value.should.equal(12);
    });
  });
});
