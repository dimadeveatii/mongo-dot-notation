# mongo-dot-notation

Transform objects to MongoDB update instructions.

[![Build status](https://github.com/dimadeveatii/mongo-dot-notation/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/dimadeveatii/mongo-dot-notation/actions/workflows/ci.yml?query=branch%3Amain++)
[![Coverage Status](https://coveralls.io/repos/github/dimadeveatii/mongo-dot-notation/badge.svg?branch=main)](https://coveralls.io/github/dimadeveatii/mongo-dot-notation?branch=main)
[![NPM Version](https://img.shields.io/npm/v/mongo-dot-notation.svg)](https://npmjs.org/package/mongo-dot-notation)
[![Downloads](https://img.shields.io/npm/dm/mongo-dot-notation)](https://npmjs.org/package/mongo-dot-notation)

```ts
import { flatten, $timestamp, $unset } from 'mongo-dot-notation';

const user = flatten({
  firstName: 'Alice',
  contact: { phone: '874-478-1254' },
  address: {
    primary: {
      state: 'NY',
      nr: 42,
    },
  },
});
```

Sets `user` to:

```json
{
  "$set": {
    "firstName": "Alice",
    "contact.phone": "874-478-1254",
    "address.primary.state": "NY",
    "address.primary.nr": 42
  }
}
```

## Installation

```sh
npm install mongo-dot-notation
```

## Highlights

- Supports all MongoDB [update operators](https://www.mongodb.com/docs/manual/reference/operator/update/)
  - Field update operators
  - Array update operators
  - Bitwise update operators
- No `npm` dependency on `mongo`
- Written in TypeScript
  - Type definitions for all exported functions
- Supports flattening and updating array elements by index

## Usage and examples

### Using operators to update fields

```ts
import { flatten, $inc, $currentDate, $push, $setOnInsert } from 'mongo-dot-notation';

const review = {
  // Add a comment and keep only the last ten ones
  comments: $push('Like it!').$each().$slice(-10),
  rating: 10,
  counters: {
    // increment the `total` by one
    total: $inc(),
  },
  details: {
    // set only if the document is inserted
    createdOn: $setOnInsert(new Date()),
    // set to current date as a mongo Date
    updatedOn: $currentDate(),
  },
};

// Provided reviews is a MongoDB collection
await reviews.updateOne(reviewId, flatten(review), { upsert: true });
```

### Flattening arrays

```ts
import { flatten } from 'mongo-dot-notation';

const user = {
  phones: [
    {
      number: '123-456-789',
      primary: true,
    },
    {
      number: '789-012-345',
    },
  ],
};

// Provided users is a MongoDB collection
await users.updateOne(userId, flatten(user, { array: true }));
```

The above `user` object is flattened to:

```json
{
  "phones.0.number": "123-456-789",
  "phones.0.primary": true,
  "phones.1.number": "789-012-345"
}
```

### Using positional operator

```ts
import { flatten, $, $inc } from 'mongo-dot-notation';

const student = {
  grades: $().$inc(),
};

// Finds the element with value 80 in the "grades" array
// and increments it by one.
student.updateOne(
  { _id: 1, grades: 80 },
  flatten(student) // { $inc: { "grades.$" : 1 } }
);
```

The position operator supports updating a nested document:

```ts
import { flatten, $, $inc } from 'mongo-dot-notation';

const student = {
  grades: $('value').$inc(),
};

// Finds the document with "value" field equal to 80 in the "grades" array
// and increments it by one.
student.updateOne(
  { _id: 1, grades: 80 },
  flatten(student) // { $inc: { "grades.$.value" : 1 } }
);
```

To update all elements in a array, use _all positional_ operator:

```ts
import { flatten, $, $inc } from 'mongo-dot-notation';

const student = {
  grades: $('[]').$inc(),
};

// Increment all grades by one
student.updateOne(
  { _id: 1 },
  flatten(student) // { $inc: { "grades.$[]" : 1 } }
);
```

Similarly, updating nested documents:

```ts
import { flatten, $, $inc } from 'mongo-dot-notation';

const student = {
  grades: $('[].values').$inc(),
};

// Increment all grades' values by one
student.updateOne(
  { _id: 1 },
  flatten(student) // { $inc: { "grades.$[].values" : 1 } }
);
```

### Using filtered positional operator

```ts
import { flatten, $, $mul } from 'mongo-dot-notation';

const student = {
  grades: $('[element]').$mul(9),
};

// Multiply by ten all grades that are below 9
student.updateOne(
  { _id: 1 },
  flatten(student), // { $mul: { "grades.$[element]" : 10 } }
  { arrayFilters: [{ element: { $lte: 9 } }] }
);
```

Similarly, updating nested documents:

```ts
import { flatten, $, $mul } from 'mongo-dot-notation';

const student = {
  grades: $('[element].value').$mul(9),
};

// Multiply by ten all grades that are below 9
student.updateOne(
  { _id: 1 },
  flatten(student), // { $mul: { "grades.$[element].value" : 10 } }
  { arrayFilters: [{ 'element.value': { $lte: 9 } }] }
);
```

### Merge array documents

Using positional operator to merge fields into the matched element:

```ts
import { flatten, $, $inc, $currentDate } from 'mongo-dot-notation';

const student = {
  grades: $().merge({
    class: '101',
    prof: 'Alice',
    value: $inc(),
    date: $currentDate(),
  }),
};

flatten(student);
```

Result:

```json
{
  "$set": {
    "grades.$.class": "101",
    "grades.$.prof": "Alice"
  },
  "$inc": {
    "grades.$.value": 1
  },
  "$currentDate": {
    "grades.$.date": { "$type": "date" }
  }
}
```

To update all elements, use `$('[]')` instead of `$()` in the above example.

### Update nested arrays

Using positional operator to update nested arrays:

```ts
import { flatten, $, $mul } from 'mongo-dot-notation';

const student = {
  grades: $().merge({
    questions: $('[]').merge({
      value: $mul(100),
    }),
  }),
};

flatten(student);
```

Calling `flatten(student)` results in:

```json
{
  "$mul": {
    "grades.$.questions.$[].value": 100
  }
}
```

See the [end-to-end](tests/mongo.e2e.ts) tests file for more examples.

## API

**Table of contents**

- [Options](#options)
- [flatten](#flatten)
- [isOperator](#isOperator)

- [Field update operators](#field-update-operators)

  - [$currentDate](#currentdate)
  - [$timestamp](#timestamp)
  - [$inc](#inc)
  - [$min](#min)
  - [$max](#max)
  - [$mul](#mul)
  - [$rename](#rename)
  - [$set](#set)
  - [$setOnInsert](#setoninsert)
  - [$unset](#unset)

- [Array update operators](#array-update-operators)

  - [$](#-positional)
  - [$addToSet](#addtoset)
  - [$pop](#pop)
  - [$pull](#pull)
  - [$push](#push)
  - [$pullAll](#pullall)
  - [$slice](#slice)
  - [$sort](#sort)

- [Bitwise update operators](#bitwise-update-operators)

  - [$bit](#bit)
  - [$and](#and)
  - [$or](#or)
  - [$xor](#xor)

### Options

The following options are available:

| Option             | Description                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `array`            | _(default `false`)_ if true, arrays will be flattened and their indexes will be used as keys. |
| `skipEmptyObjects` | _(default `false`)_ if true, empty objects are ignored and removed from the flattened result. |

**Example:**

```ts
flatten({ rules: [{ value: 7 }] }, { array: true });
// { $set: { 'rules.0.value': 7 } }

flatten({ rules: [{ value: 7 }] }, { array: false });
// { $set: { 'rules': [{value: 7}] } }

flatten({ left: { x: 1 }, right: {} }, { skipEmptyObjects: true });
// { $set: { 'left.x': 1 } }

flatten({ left: { x: 1 }, right: {} }, { skipEmptyObjects: false });
// { $set: { 'left.x': 1, 'right': {} } }
```

### flatten

> `$flatten<T>(obj: T, options?: Options)`

Transforms a given object into the MongoDB's update instructions.

| Param     | Description                                              |
| --------- | -------------------------------------------------------- |
| `obj`     | _(required)_ the input object to transform               |
| `options` | _(optional)_ additional options, see [Options](#options) |

**Example:**

```ts
flatten({
  firstName: 'Alice',
  contact: { phone: '874-478-1254' },
  address: {
    primary: {
      state: 'NY',
      nr: 42,
    },
  },
});
```

### isOperator

> `isOperator<T>(obj: T): boolean`

Checks if a given object is an operator.

| Param | Description                            |
| ----- | -------------------------------------- |
| `obj` | _(required)_ the input object to check |

**Example:**

```ts
isOperator($set(1)); // true
isOperator({}); // false
```

---

### Field update operators

### $currentDate

> `$currentDate(type?: 'date' | 'timestamp')`

| Param  | Description                                                                                                                                                                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | _(default `date`)_ sets to MongoDB's [Date](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date) or [Timestamp](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-timestamp) type. |

Sets the value of a field to the current date.

**Example:**

```ts
flatten({
  createdOn: $currentDate(),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/currentDate/)

### $timestamp

> `$timestamp()`

Sets the value of a field to the current date as a MondoDB's [Timestamp](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-timestamp) type.

This function is an alias for `$currentDate('timestamp')`.

**Example:**

```ts
flatten({
  updatedOn: $timestamp(),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/currentDate/)

### $inc

> `$inc<T>(value?: T)`

Increments a field by a specified value.

| Param   | Description                   |
| ------- | ----------------------------- |
| `value` | _(default 1)_ increment value |

**Example:**

```ts
flatten({
  visits: $inc(),
  clicks: $inc(5),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/inc/)

### $min

> `$min<T>(value: T)`

Updates the value of the field to a specified value if the specified value is **less than** the current value of the field.

| Param   | Description            |
| ------- | ---------------------- |
| `value` | _(required)_ min value |

**Example:**

```ts
flatten({
  score: $min(100),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/min/)

### $max

> `$max<T>(value: T)`

Updates the value of the field to a specified value if the specified value is **greater than** the current value of the field.

| Param   | Description            |
| ------- | ---------------------- |
| `value` | _(required)_ max value |

**Example:**

```ts
flatten({
  score: $max(0),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/max/)

### $mul

> `$mul<T>(value?: T)`

Multiplies the value of a field by a number.

| Param   | Description                   |
| ------- | ----------------------------- |
| `value` | _(default 1)_ multiply factor |

**Example:**

```ts
flatten({
  score: $mul(2.5),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/max/)

### $rename

> `$rename(field: string)`

Updates the name of a field.

| Param   | Description                 |
| ------- | --------------------------- |
| `field` | _(required)_ new field name |

**Example:**

```ts
flatten({
  profile: {
    first_name: $rename('firstName'),
  },
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/rename/)

### $set

> `$set<T>(value: T)`

Replaces the value of a field with the specified value.  
This is an implicit operator, but could be useful when an entire object should be replaced.

| Param   | Description                    |
| ------- | ------------------------------ |
| `value` | _(required)_ replacement value |

**Example:**

```ts
// Replaces the address object entirely rather than just
// updating the "city" field.
flatten({
  address: $set({ city: 'NY' }),
  profile: { name: 'Alice' },
});

// Outputs:
// {
//   "$set": {
//     "address": { "city": "NY" },
//     "profile.name": "Alice"
//   }
// }
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/set/)

### $setOnInsert

> `$setOnInsert<T>(value: T)`

Assigns the specified value to the field when `{ upsert: true }` operation is used and
results in a new document being created. If the update operation does not result in an insert,
does nothing.

| Param   | Description                                        |
| ------- | -------------------------------------------------- |
| `value` | _(required)_ the value to set on document creation |

**Example:**

```ts
flatten({
  logging: {
    createdOn: $setOnInsert(new Date()),
  },
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/setOnInsert/)

### $unset

> `$unset()`

Deletes the specified field from a document.

**Example:**

```ts
flatten({
  resetPassword: $unset(),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/unset/)

---

### Array update operators

### $ _(positional)_

> `$(field?: number | string)`

The positional operator identifies **an element** or **multiple elements** matching a
given query condition to be updated in an array.

| Param   | Description                                                                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `field` | _(optional)_ when empty - performs the update on array's element; <br/>when a number or a string starting with a number, specifies the index of the element to update or its field;<br/>when starts with `"[]"` or `"[query]"`, specifies that this is an _all positional_ operator; |

**Example:**

```ts
// Sets to 7 first element that matches the update query
$().$set(7);

// Increment by one the first element's `score` field that matches the update query
$('score').$inc(1);

// Multiplies all elements by two
$('[]').$mul(2);

// Ensures all elements in array are positive
$('[].score').$max(0);

// Find all `grades` documents that have the `std` lower than seven
// and increment their `grade` by ten.
collection.updateOne(criteria, flatten({ grades: $('[element].grade').$inc(10) }), {
  arrayFilters: [{ 'element.std': { $lt: 7 } }],
});
```

See [update nested arrays](#update-nested-arrays) for examples using `$().merge`.

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/positional/)

### $addToSet

> `$addToSet<T>(value: T | T[])`

Adds a value to an array unless the value is already present.
To add multiple values, chain with `$each` operator.

| Param   | Description                              |
| ------- | ---------------------------------------- |
| `value` | _(required)_ the value to add to the set |

Note that while `$addToSet([1, 2])` adds the entire array as single element,
`$addToSet([1, 2]).$each()` adds 1 and 2 as separate elements.

**Example:**

```ts
// add just one element
flatten({ permissions: $addToSet('admin') });

// add multiple elements
flatten({ permissions: $addToSet(['read', 'write']).$each() });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/)

### $pop

> `$pop(value?: -1 | 1)`

Removes the first or last element of an array

| Param   | Description                                                                            |
| ------- | -------------------------------------------------------------------------------------- |
| `value` | _(default 1)_ specify `-1` to remove the first element, `1` to remove the last element |

**Example:**

```ts
// remove the first element from the array
flatten({ grades: $pop(-1) });
// equivalent to:
flatten({ grades: $pop().first() });

// remove the last element from the array
flatten({ scores: $pop(1) });
// equivalent to:
flatten({ scores: $pop().last() });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/pop/)

### $pull

> `$pull<T>(value: T | T[])`

Removes from an existing array all instances of a value or values that match a specified condition.
Unlike the [$pullAll](#pullall) operator, this operator can be used to remove all instances that match a query.

| Param   | Description                                                                        |
| ------- | ---------------------------------------------------------------------------------- |
| `value` | _(required)_ the value(s) to remove or the condition to match for removed elements |

**Example:**

```ts
// remove all instances of the value `0` and `1` from the array;
// same as using $pullAll
flatten({ scores: $pull([0, 1]) });

// remove all instances lower than or equal to `3`
flatten({ scores: $pull({ $lte: 3 }) });

// remove all documents with the field `name` equal to `Test`
flatten({ users: $pull({ name: { $eq: 'Test' } }) });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/pull/)

### $push

> `$push<T>(value?: T | T[])`

Appends a specified value to an array.
Can be chained with `.$slice()`, `.$sort()` and `.$position()` modifiers to specify how the array should be updated.  
The order in which additional operators are chained doesn't matter, so that `$push().$each().$slice().$sort()` is the same as
`$push().$each().$sort().$slice()`.

| Param   | Description                                      |
| ------- | ------------------------------------------------ |
| `value` | _(optional)_ the value(s) to append to the array |

**Example:**

```ts
// append one element
flatten({ scores: $push(1) });

// append multiple elements
flatten({ scores: $push([1, 2, 3]).$each() });

// append an element and update to leave only the last ten
flatten({ scores: $push(7).$each().$slice(-10) });

// append an element and update to leave only the last ten sorted by value
flatten({ scores: $push(7).$each().$sort(1).$slice(-10) });

// append an element at position three in the array
flatten({ scores: $push(7).$each().$position(2) });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/push/)

### $pullAll

> `$pullAll<T>(value: T | T[])`

Removes all instances of the specified values from an existing array.

| Param   | Description                                        |
| ------- | -------------------------------------------------- |
| `value` | _(required)_ the value(s) to remove from the array |

**Example:**

```ts
// remove all instances of the value `1` and `2` from the array
flatten({ score: $pullAll([1, 2]) });

// remove all instances of the value `0`
flatten({ score: $pullAll(0) });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/pullAll/)

### $slice

> `$slice(count: number)`

Limits the number of array elements.
Alias for `$push().$each().$slice()`.

| Param   | Description                             |
| ------- | --------------------------------------- |
| `count` | _(required)_ number of elements to take |

**Example:**

```ts
// leave only the first 3 elements
flatten({ grades: $slice(3) });

// leave only the last element
flatten({ grades: $slice(-1) });

// empty the array
flatten({ grades: $slice(0) });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/slice/)

### $sort

> `$sort<T>(specification?: T)`

Orders the elements of an array.
Alias for `$push().$each().$sort()`.

| Param           | Description                      |
| --------------- | -------------------------------- |
| `specification` | _(default 1)_ sort specification |

**Example:**

```ts
// sort ascending
flatten({ scores: $sort(1) });

// sort descending
flatten({ scores: $sort(-1) });

// sort ascending an array of documents with `name` field
flatten({ users: $sort({ name: 1 }) });
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/sort/)

---

### Bitwise update operators

### $bit

> `$bit()`

Performs a bitwise update of a field.
Should be chained with a logical operator.

**Example:**

```ts
flatten({
  admin: $bit().$and(7),
  read: $bit().$or(4),
  write: $bit().$xor(3),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/bit/)

### $and

> `$and<T>(value: T)`

Uses a bitwise _and_ operation to update a field.
Alias for `$bit().$and()`.

**Example:**

```ts
flatten({
  admin: $and(7),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-and)

### $or

> `$or<T>(value: T)`

Uses a bitwise _or_ operation to update a field.
Alias for `$bit().$or()`.

**Example:**

```ts
flatten({
  read: $or(4),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-or)

### $xor

> `$xor<T>(value: T)`

Uses a bitwise _xor_ operation to update a field.
Alias for `$bit().$xor()`.

**Example:**

```ts
flatten({
  write: $xor(3),
});
```

[MongoDB manual](https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-xor)

## License

[MIT](LICENSE)
