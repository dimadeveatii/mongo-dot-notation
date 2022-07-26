import { MongoClient, Db, Collection, Timestamp } from 'mongodb';
import {
  $,
  $addToSet,
  $and,
  $bit,
  $currentDate,
  $inc,
  $max,
  $min,
  $mul,
  $or,
  $pop,
  $pull,
  $pullAll,
  $push,
  $rename,
  $setOnInsert,
  $timestamp,
  $unset,
  $xor,
  flatten,
} from '../dist';

const MongoUrl = process.env.MONGODB_URL as string;

describe('End-to-end tests', () => {
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    client = await MongoClient.connect(MongoUrl);
    db = client.db();
  });

  afterAll(() => client.close());

  describe('Fields operators', () => {
    const userMock = {
      email: 'john.doe@test.com',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      address: {
        country: 'USA',
        city: 'NY',
        postCode: 'AB1234',
      },
    };
    let collection: Collection<typeof userMock>;

    const updateUser = async (value: any) => {
      const searchCriteria = { email: userMock.email };
      await collection.updateOne(searchCriteria, value);
      const usr = await collection.findOne(searchCriteria);
      if (usr === null) {
        throw new Error('user not found');
      }

      return usr;
    };

    beforeAll(() => {
      collection = db.collection('users');
    });

    beforeEach(() => collection.insertOne(userMock));
    afterEach(() => collection.drop());

    it('User should exist', async () => {
      const usr = await collection.findOne({ email: userMock.email });
      expect(usr).toMatchObject(userMock);
    });

    it('Update name', async () => {
      const user = await updateUser(flatten({ firstName: 'Jack' }));
      expect(user).toHaveProperty('firstName', 'Jack');
    });

    it('Update name to null', async () => {
      const user = await updateUser(flatten({ firstName: null }));
      expect(user).toHaveProperty('firstName', null);
    });

    it('Update address city', async () => {
      const user = await updateUser(flatten({ address: { city: 'Boston' } }));
      expect(user.address).toStrictEqual({ ...userMock.address, city: 'Boston' });
    });

    it('Add new `number` property to address', async () => {
      const user = await updateUser(flatten({ address: { number: 9 } }));
      expect(user.address).toStrictEqual({ ...userMock.address, number: 9 });
    });

    it('Increment age with a default value', async () => {
      const user = await updateUser(flatten({ age: $inc() }));
      expect(user).toHaveProperty('age', userMock.age + 1);
    });

    it('Increment age with 5', async () => {
      const user = await updateUser(flatten({ age: $inc(5) }));
      expect(user).toHaveProperty('age', userMock.age + 5);
    });

    it('Multiply age with a default value', async () => {
      const user = await updateUser(flatten({ age: $mul() }));
      expect(user).toHaveProperty('age', userMock.age);
    });

    it('Multiply age by two', async () => {
      const user = await updateUser(flatten({ age: $mul(2) }));
      expect(user).toHaveProperty('age', userMock.age * 2);
    });

    it('Rename firstName to first_name', async () => {
      const user = await updateUser(flatten({ firstName: $rename('first_name') }));
      expect(user).not.toHaveProperty('firstName');
      expect(user).toHaveProperty('first_name', userMock.firstName);
    });

    it('Unset lastName', async () => {
      const user = await updateUser(flatten({ lastName: $unset() }));
      expect(user).not.toHaveProperty('lastName');
    });

    it('Update age to min when less than current value', async () => {
      const user = await updateUser(flatten({ age: $min(userMock.age - 5) }));
      expect(user).toHaveProperty('age', userMock.age - 5);
    });

    it('Update age to min when greater than current value', async () => {
      const user = await updateUser(flatten({ age: $min(userMock.age + 5) }));
      expect(user).toHaveProperty('age', userMock.age);
    });

    it('Update age to max when less than current value', async () => {
      const user = await updateUser(flatten({ age: $max(userMock.age - 5) }));
      expect(user).toHaveProperty('age', userMock.age);
    });

    it('Update age to max when greater than current value', async () => {
      const user = await updateUser(flatten({ age: $max(userMock.age + 5) }));
      expect(user).toHaveProperty('age', userMock.age + 5);
    });

    it('Set `updatedOn` to current date', async () => {
      const user = await updateUser(flatten({ updatedOn: $currentDate() }));
      expect(user).toHaveProperty('updatedOn');
      expect((user as any).updatedOn).toBeInstanceOf(Date);
    });

    it('Set `time` to current timestamp', async () => {
      const user = await updateUser(flatten({ time: $timestamp() }));
      expect(user).toHaveProperty('time');
      expect((user as any).time).toBeInstanceOf(Timestamp);
    });

    it('Update `pass` with $setOnInsert', async () => {
      const user = await updateUser(flatten({ pass: $setOnInsert('change-me-next-time') }));
      expect(user).not.toHaveProperty('pass');
    });

    it('Insert `pass` with $setOnInsert', async () => {
      const criteria = { email: 'test@test.com' };
      const value = 'change-me-next-time';
      await collection.updateOne(criteria, flatten({ pass: $setOnInsert(value) }), {
        upsert: true,
      });
      const user = await collection.findOne(criteria);

      expect(user).toHaveProperty('pass', value);
    });
  });

  describe('Array operators', () => {
    let collection: Collection<any>;
    const searchCriteria = { userId: 1 };

    const updateUser = async (updateCriteria: any, value: any) => {
      await collection.updateOne(updateCriteria, value);
      return await collection.findOne(searchCriteria);
    };

    beforeAll(() => {
      collection = db.collection('users');
    });
    beforeEach(() =>
      collection.insertOne({ userId: searchCriteria.userId, scores: [0, 2, 5, 5, 1, 3] })
    );
    afterEach(() => collection.drop());

    it('Increment by 2 the score with value 1', async () => {
      const user = await updateUser(
        { ...searchCriteria, scores: { $eq: 1 } },
        flatten({ scores: $().$inc(2) })
      );
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 3, 3]);
    });

    it('Unset the score with value 0', async () => {
      const user = await updateUser(
        { ...searchCriteria, scores: { $eq: 0 } },
        flatten({ scores: $().$unset() })
      );
      expect(user.scores).toStrictEqual([null, 2, 5, 5, 1, 3]);
    });

    it('Multiply all values by 10', async () => {
      const user = await updateUser({ ...searchCriteria }, flatten({ scores: $('[]').$mul(10) }));
      expect(user.scores).toStrictEqual([0, 20, 50, 50, 10, 30]);
    });

    it('Set the nested field for an element with a given grade value', async () => {
      await collection.drop();
      await collection.insertOne({
        ...searchCriteria,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 },
        ],
      });

      await collection.updateOne(
        { ...searchCriteria, 'grades.grade': 85 },
        flatten({ grades: $('std').$set(6) })
      );
      const user = await collection.findOne({ ...searchCriteria });

      expect(user.grades).toStrictEqual([
        { grade: 80, mean: 75, std: 8 },
        { grade: 85, mean: 90, std: 6 },
        { grade: 90, mean: 85, std: 3 },
      ]);
    });

    it('Increment all grades by 10 in nested documents', async () => {
      await collection.drop();
      await collection.insertOne({
        ...searchCriteria,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 },
        ],
      });

      await collection.updateOne(
        { ...searchCriteria },
        flatten({ grades: $('[].grade').$inc(10) })
      );
      const user = await collection.findOne({ ...searchCriteria });

      expect(user.grades).toStrictEqual([
        { grade: 90, mean: 75, std: 8 },
        { grade: 95, mean: 90, std: 5 },
        { grade: 100, mean: 85, std: 3 },
      ]);
    });

    it('Increment the grades by 10 in nested documents with std lower than 8', async () => {
      await collection.drop();
      await collection.insertOne({
        ...searchCriteria,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 },
        ],
      });

      await collection.updateOne(
        { ...searchCriteria },
        flatten({ grades: $('[element].grade').$inc(10) }),
        { arrayFilters: [{ 'element.std': { $lt: 7 } }] }
      );
      const user = await collection.findOne({ ...searchCriteria });

      expect(user.grades).toStrictEqual([
        { grade: 80, mean: 75, std: 8 },
        { grade: 95, mean: 90, std: 5 },
        { grade: 100, mean: 85, std: 3 },
      ]);
    });

    it('Update element at position 2', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $(2).$set(100) }));
      expect(user.scores).toStrictEqual([0, 2, 100, 5, 1, 3]);
    });

    it('Update nested element at position 1', async () => {
      await collection.drop();
      await collection.insertOne({
        ...searchCriteria,
        grades: [
          { grade: 80, mean: 75, std: 8 },
          { grade: 85, mean: 90, std: 5 },
          { grade: 90, mean: 85, std: 3 },
        ],
      });

      await collection.updateOne(searchCriteria, flatten({ grades: $('1.mean').$inc(9) }));
      const user = await collection.findOne(searchCriteria);

      expect(user.grades).toStrictEqual([
        { grade: 80, mean: 75, std: 8 },
        { grade: 85, mean: 99, std: 5 },
        { grade: 90, mean: 85, std: 3 },
      ]);
    });

    it('Add a new element to the set', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $addToSet(9) }));
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 1, 3, 9]);
    });

    it('Add an existing element to the set', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $addToSet(2) }));
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 1, 3]);
    });

    it('Add multiple array elements', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $addToSet([2, 9]).$each() }));
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 1, 3, 9]);
    });

    it('Pop the first element', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pop().first() }));
      expect(user.scores).toStrictEqual([2, 5, 5, 1, 3]);
    });

    it('Pop the last element', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pop().last() }));
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 1]);
    });

    it('Pull all values of 5', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pullAll(5) }));
      expect(user.scores).toStrictEqual([0, 2, 1, 3]);
    });

    it('Pull all existing values', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $pullAll([0, 2, 5, 5, 1, 3]) })
      );
      expect(user.scores).toHaveLength(0);
    });

    it('Pull value 5', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pull(5) }));
      expect(user.scores).toStrictEqual([0, 2, 1, 3]);
    });

    it('Pull values greater than 2', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pull({ $gte: 2 }) }));
      expect(user.scores).toStrictEqual([0, 1]);
    });

    it('Pull multiple values', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $pull([0, 1]) }));
      expect(user.scores).toStrictEqual([2, 5, 5, 3]);
    });

    it('Push 9', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $push(9) }));
      expect(user.scores).toStrictEqual([0, 2, 5, 5, 1, 3, 9]);
    });

    it('Push 9 at zero position', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push(9).$each().$position(0) })
      );
      expect(user.scores).toStrictEqual([9, 0, 2, 5, 5, 1, 3]);
    });

    it('Push 9 and slice last 3 values', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push(9).$each().$slice(-3) })
      );
      expect(user.scores).toStrictEqual([1, 3, 9]);
    });

    it('Push 9 and sort ASC', async () => {
      const user = await updateUser(searchCriteria, flatten({ scores: $push(9).$each().$sort() }));
      expect(user.scores).toStrictEqual([0, 1, 2, 3, 5, 5, 9]);
    });

    it('Push 9 and sort DESC', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push(9).$each().$sort(-1) })
      );
      expect(user.scores).toStrictEqual([9, 5, 5, 3, 2, 1, 0]);
    });

    it('Push [9, 99], sort ASC and slice last 3', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push([9, 99]).$each().$sort().$slice(-3) })
      );
      expect(user.scores).toStrictEqual([5, 9, 99]);
    });

    it('Push [9, 99], sort ASC and slice first 3', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push([9, 99]).$each().$sort().$slice(3) })
      );
      expect(user.scores).toStrictEqual([0, 1, 2]);
    });

    it('Push [9, 99], at position 1 and slice first 3', async () => {
      const user = await updateUser(
        searchCriteria,
        flatten({ scores: $push([9, 99]).$each().$position(1).$slice(3) })
      );
      expect(user.scores).toStrictEqual([0, 9, 99]);
    });
  });

  describe('Bitwise operators', function () {
    const pointMock = { map: 'NY', value: 11 };
    let collection: Collection<typeof pointMock>;

    const updatePoint = async (value: any) => {
      await collection.updateOne({ map: pointMock.map }, value);
      const result = await collection.findOne({ map: pointMock.map });
      if (!result) {
        throw new Error('Not found.');
      }

      return result;
    };

    beforeAll(() => {
      collection = db.collection('users');
    });

    beforeEach(async () => collection.insertOne(pointMock));
    afterEach(async () => collection.drop());

    it.each([$and(7), $bit().$and(7)])(
      'Perform bitwise AND operation 11 & 7 = 1011 & 0111 = 0011 = 3',
      async (value) => {
        const point = await updatePoint(flatten({ value }));
        expect(point.value).toStrictEqual(pointMock.value & 7);
      }
    );

    it.each([$or(7), $bit().$or(7)])(
      'Perform bitwise OR operation 11 | 7 = 1011 & 0111 = 1111 = 15',
      async (value) => {
        const point = await updatePoint(flatten({ value }));
        expect(point.value).toStrictEqual(pointMock.value | 7);
      }
    );

    it.each([$xor(7), $bit().$xor(7)])(
      'Perform bitwise XOR operation 11 | 7 = 1011 & 0111 = 1100 = 12',
      async (value) => {
        const point = await updatePoint(flatten({ value }));
        expect(point.value).toStrictEqual(pointMock.value ^ 7);
      }
    );
  });
});
