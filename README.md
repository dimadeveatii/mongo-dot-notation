mongo-dot-notation
========
Fast, lightweight library to transform objects to mongo update instructions using operators.

[![NPM Version](https://img.shields.io/npm/v/mongo-dot-notation.svg)](https://npmjs.org/package/mongo-dot-notation)
[![Build Status](https://travis-ci.org/dimadeveatii/mongo-dot-notation.svg?branch=master)](https://travis-ci.org/dimadeveatii/mongo-dot-notation)
[![Coverage Status](https://coveralls.io/repos/github/dimadeveatii/mongo-dot-notation/badge.svg)](https://coveralls.io/github/dimadeveatii/mongo-dot-notation)

```javascript
var $ = require('mongo-dot-notation')

var instructions = $.flatten({
  firstName: 'John',
  contact: { phone: '874-478-1254' },
  lastUpdate: $.$currentDate()
})

/*
{
  $currentDate: {
    lastUpdate: { $type: 'date' }
  },
  $set: {
    'firstName': 'John',
    'contact.phone': '874-478-1254'
  }
}
*/
```

## Installation

```bash
  $ npm install mongo-dot-notation --save
```

## Features
  * Transform objects to mongo update instructions
    * supports embedded documents
    * understands mongo types (ObjectID, Int32 etc.)
  * Full support of mongo update operators
    * Field update operators
    * Array update operators
    * Bitwise update operators
  * Compatible with node >= 0.12
  * No dependencies on mongo

## Usage
Using `$.flatten` and operators to transform to mongo update instructions.
```javascript
var $ = require('mongo-dot-notation')

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost:27017/mydatabase'

MongoClient.connect(url).then(function(db) {
  return db.collection('users').update(
    { username: 'johndoe@test.com' },
    $.flatten({
      comments: $.$push('Logged in.').$each().$slice(-100),
      system: 'demo',
      login: {
        date: $.$currentDate()
      },
      analytics: {
        visits: $.$inc()
      },
      account: {
        createdOn: $.$setOnInsert(new Date()),
        blocked: $.$unset(),
        attempts: 0,
        logins: $.$inc()
      }
    })
  })
```

Without `mongo-dot-notation` update instructions should look like:
``` javascript
  ...
  return collection.update(
    { username: 'johndoe@test.com' },
    {
      $set: {
        'system': 'demo',
        'account.attempts': 0
      },
      $push: {
        'comments': {
          '$each': ['Logged in.'],
          '$slice': -100
        }
      }
      $currentDate: {
        'login.date': 'date'
      },
      $inc: {
        'analytics.visits': 1,
        'account.logins': 1,
      },
      $unset: {
        'account.blocked': ''
      },
      $setOnInsert: {
        'account.createdOn': new Date()
      }
    })
  })
```

## Tests

To run the test suite make sure you have mongo installed locally on the default port (*27017*).
Mongo is used to run integration tests.
Once mongo is available, install the dependencies, then run `npm test`:

```bash
$ npm install
$ npm test
```

## API

## `.flatten()`
Use `.flatten()` to transform objects:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  account: {
    name: 'hero'
  }
})
// { '$set': { 'account.name': 'hero' } }
```

## `.isOperator()`
Checks if a given value is a `mongo-dot-notation` operator:
```javascript
var $ = require('mongo-dot-notation')
$.isOperator(1) // false
$.isOperator({}) // false
$.isOperator($.$set(10)) // true
```

See below the list of all supported mongo update opertors.

## Mongo update operators

### Field update operators

#### [`$inc`](https://docs.mongodb.com/manual/reference/operator/update/inc/#up._S_inc)
The `$inc` operator increments a field by a specified value.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  visits: $.$inc() // default: increments by 1
})
// { '$inc': { 'visits': 1 } }
```

Increment by a given value:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  visits: $.$inc(5)
})
// { '$inc': { 'visits': 5 } }
```

#### [`$mul`](https://docs.mongodb.com/manual/reference/operator/update/mul/#mul)
Multiplies the value of a field by a number. (*Supported in mongo >= 2.6*)
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  price: $.$mul(0.75)
})
// { '$mul': { 'price': 0.75 } }
```

#### [`$rename`](https://docs.mongodb.com/manual/reference/operator/update/rename/#rename)
The $rename operator updates the name of a field.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  nmae: $.$rename('name')
})
// { '$rename': { 'nmae': 'name' } }
```

#### [`$setOnInsert`](https://docs.mongodb.com/manual/reference/operator/update/setOnInsert/#setoninsert)
Assigns value to field only when the document is inserted (when an update operation is with `upsert:true`). (*Supported in mongo >= 2.4*)
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  createdOn: $.$setOnInsert(new Date())
})
// { '$setOnInsert': { 'createdOn': new Date() } }
```

#### [`$set`](https://docs.mongodb.com/manual/reference/operator/update/set/#set)
The $set operator replaces the value of a field with the specified value.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  name: $.$set('Mike')
})
// { '$set': { 'name': 'Mike' } }
```

The $set is an implicit operator, meaning if an object is passed to `$.flatten`, it will navigate through own and embedded document fields and apply $set.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  name: 'Mike',
  contactDetails: {
    email: 'mike@test.com'
  }
})

// { 
//   '$set': { 
//     'name': 'Mike',
//     'contactDetails.email': 'mike@test.com'
//   } 
// }
```

The $set operator could also be used to reset an embedded field to a new document:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  name: 'Mike',
  contactDetails: $.$set({
    email: 'mike@test.com'
  })
})

// { 
//   '$set': { 
//     'name': 'Mike',
//     'contactDetails': { email: 'mike@test.com' }
//   } 
// }
```

#### [`$unset`](https://docs.mongodb.com/manual/reference/operator/update/unset/#unset)
The $unset operator deletes a particular field.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  comments: $.$unset(),
  history: $.$unset()
})
// { '$unset': { 'comments': '', 'history': '' } }
```

#### [`$min`](https://docs.mongodb.com/manual/reference/operator/update/min/#min)
The $min updates the value of the field to a specified value if the specified value is less than the current value of the field.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  low: $.$min(200)
})
// { '$min': { 'low': 200 } }
```

#### [`$max`](https://docs.mongodb.com/manual/reference/operator/update/max/#max)
The $max operator updates the value of the field to a specified value if the specified value is greater than the current value of the field.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  high: $.$max(450)
})
// { '$max': { 'high': 450 } }
```

#### [`$currentDate`](https://docs.mongodb.com/manual/reference/operator/update/currentDate/#currentdate)
The $currentDate operator sets the value of a field to the current date, either as a *Date* or a *timestamp*.
If type is not specified, uses *Date* by default.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  lastUpdate: $.$currentDate()
})
// { '$currentDate': { 'lastUpdated': { '$type': 'date' } } }
```

To set as a timestamp, use:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  lastUpdate: $.$currentDate('timestamp')
})
// { '$currentDate': { 'lastUpdated': { '$type': 'timestamp' } } }
```

Also, for timestamp an alias operator is defiled in `mongo-dot-notation`:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  lastUpdate: $.$timestamp()
})
// { '$currentDate': { 'lastUpdated': { '$type': 'timestamp' } } }
```

### Array update operators
#### [`$ (update)`](https://docs.mongodb.com/manual/reference/operator/update/positional/)
The positional $ operator identifies an element in an array to update without explicitly specifying the position of the element in the array.
```javascript
var $ = require('mongo-dot-notation')
db.students.update(
   { _id: 1, grades: 80 },
   $.flatten({
     grades: $.$().$set(82)
   })
   
)
// { $set: { "grades.$" : 82 } }
```

In order to update the matched document's field:
```javascript
var $ = require('mongo-dot-notation')
db.students.update(
   { _id: 1, grades: 80 },
   $.flatten({
     grades: $.$('std').$set(1.5)
   })
   
)
// { $set: { "grades.$.std" : 1.5 } }
```

The `$` positional operator is chainable with all mongo supported update fields.
```javascript
var $ = require('mongo-dot-notation')
db.students.update(
   { _id: 1, grades: 80 },
   $.flatten({
     grades: $.$().$mul(0.1)
   })
   
)
// { $mul: { "grades.$" : 0.1 } }
```

Can also be used to update array element given an index:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  grades: $.$(0).$set(100)
})
// { $set: { "grades.0" : 0.1 } }
```
Same, when updating the element's field:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  months: $.$('5.avgTemp').$set(25.7)
})
// { $set: { "months.5.avgTemp" : 25.7 } }
```

#### [`$addToSet`](https://docs.mongodb.com/manual/reference/operator/update/addToSet)
The $addToSet operator adds a value to an array unless the value is already present, in which case $addToSet does nothing to that array.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$addToSet(5)
})
// { '$addToSet': { 'values': 5 } }
```

To add each value from a given array:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$addToSet([7, 1, 4]).$each()
})
// { '$addToSet': { 'values': { '$each': [7, 1, 4] } } }
```

#### [`$pop`](https://docs.mongodb.com/manual/reference/operator/update/pop)
The $pop operator removes the first or last element of an array. Pass $pop a value of -1 to remove the first element of an array and 1 to remove the last element in an array.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pop() // removes by default last element
})
// { '$pop': { 'values': 1 } }
```

To remove first element from the array:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pop(-1)
})
// { '$pop': { 'values': -1 } }
```

There are chainable `.first()` and `.last()` methods defined:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  indexes: $.$pop().first(),
  scores: $.$pop().last(),
})
// { '$pop': { 'indexes': -1, scores: 1 } }
```

#### [`$pullAll`](https://docs.mongodb.com/manual/reference/operator/update/pullAll/)
The $pullAll operator removes all instances of the specified values from an existing array.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pullAll([0, 1])
})
// { '$pullAll': { 'values': [0, 1] } }
```

#### [`$pull`](https://docs.mongodb.com/manual/reference/operator/update/pull/)
The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pull(7)
})
// { '$pull': { 'values': 7 } }
```

If an array is provided, implicitly applies `$in` operator:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pull([0, 1])
})
// { '$pull': { 'values': { '$in': [0, 1] } } }
```

See mongo documentation for [conditions](https://docs.mongodb.com/manual/reference/operator/update/pull/#remove-all-items-that-match-a-specified-pull-condition).

#### [`$pushAll`](https://docs.mongodb.com/manual/reference/operator/update/pushAll/)
The $pushAll operator appends the specified values to an array. (*Note that this operator is deprecated since mongo 2.4.*)
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  values: $.$pushAll([1, 2, 3])
})
// { '$pushAll': { 'values': [1, 2, 3] } }
```

#### [`$push`](https://docs.mongodb.com/manual/reference/operator/update/push/)
The $push operator appends a specified value to an array. Can also be used to slice and sort the array.
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  grades: $.$push({ grade: 'A' })
})
// { '$push': { 'grades': { grade: 'A' } } }
```

To push several values, chain with `.$each()`
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  grades: $.$push([{ grade: 'A' }, { grade: 'B' }]).$each()
})
 
// { 
//   '$push': { 
//     'grades': {
//       '$each': [{ grade: 'A' }, { grade: 'B' }]
//     }  
//   }
// }
```

To push values at a specific position use `.$position()` (*requires the use of .$each(). Supported in mongo >= 2.6*)
```javascript
var $ = require('mongo-dot-notation')

// insert as a first element in the array
$.flatten({
  grades: $.$push({ grade: 'A' }).$each().$position(0)
})
 
// { 
//   '$push': { 
//     'grades': {
//       '$each': [{ grade: 'A' }],
//       '$position': 0  
//     }  
//   }
// }
```

To slice the array, use `.slice()` (*requires the use of .$each(). Supported in mongo >= 2.6*)
```javascript
var $ = require('mongo-dot-notation')

// insert the element and limit to last 10 values
$.flatten({
  grades: $.$push({ grade: 'A' }).$each().$slice(-10)
})
 
// { 
//   '$push': { 
//     'grades': {
//       '$each': [{ grade: 'A' }],
//       '$slice': -10  
//     }  
//   }
// }
```

To sort the array, use `.sort()` (*requires the use of .$each(). Supported in mongo >= 2.4*)
```javascript
var $ = require('mongo-dot-notation')

// insert the element and sorts descending by grade
$.flatten({
  grades: $.$push({ grade: 'A' }).$each().$sort({ grade: -1})
})
 
// { 
//   '$push': { 
//     'grades': {
//       '$each': [{ grade: 'A' }],
//       '$sort': { grade: -1}  
//     }  
//   }
// }
```

Multiple instructions can be chained:
```javascript
var $ = require('mongo-dot-notation')

// insert the element, sorts descending by grade 
// and slices only first 10 values
$.flatten({
  grades: $.$push({ grade: 'A' }).$each().$sort({ grade: -1}).$slice(10)
})
 
// { 
//   '$push': { 
//     'grades': {
//       '$each': [{ grade: 'A' }],
//       '$sort': { grade: -1},
//       '$slice': 10
//     }  
//   }
// }
```

### Bitwise update operators
#### [`$bit`](https://docs.mongodb.com/manual/reference/operator/update/bit/)
The $bit operator performs a bitwise update of a field. The operator supports bitwise and, bitwise or, and bitwise xor (i.e. exclusive or) operations.  
*Note XOR is supported in mongo >= 2.6*

```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  owner: $.$bit().$and(7) // performs a bitwise AND 
  user: $.$bit().$or(1) // performans a bitwise OR
  group: $.$bit().$xor(5) // performs a bitwise XOR
})

// { 
//   '$bit': { 
//     'owner': { and: 7 },
//     'user': { or: 1 },
//     'group': { xor: 5 },
//   } 
// }
```

Following aliases are defined in `mongo-dot-notation`:
```javascript
var $ = require('mongo-dot-notation')
$.flatten({
  owner: $.$and(7),
  user: $.$or(1),
  group: $.$xor(5),
})

// { 
//   '$bit': { 
//     'owner': { and: 7 },
//     'user': { or: 1 },
//     'group': { xor: 5 },
//   } 
// }
```

## License
[MIT](LICENSE)

Copyright © 2015-2017 Dumitru Deveatii
