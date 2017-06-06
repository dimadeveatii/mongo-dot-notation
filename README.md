mongo-dot-notation
========
Convert simple objects to mongo update operators. <br/>

[![NPM Version](https://img.shields.io/npm/v/mongo-dot-notation.svg)](https://npmjs.org/package/mongo-dot-notation)
[![Build Status](https://travis-ci.org/dimadeveatii/mongo-dot-notation.svg?branch=master)](https://travis-ci.org/dimadeveatii/mongo-dot-notation)
[![Coverage Status](https://coveralls.io/repos/github/dimadeveatii/mongo-dot-notation/badge.svg)](https://coveralls.io/github/dimadeveatii/mongo-dot-notation)

This lightweight library can be used to create a more readable code when working with mongo updates. 
You focus on updated properties of the document, rather than on mongo update instructions.
##### Example:
```javascript
var $ = require('mongo-dot-notation');

var MongoClient = require('mongodb').MongoClient;
 
var url = 'mongodb://localhost:27017/mydatabase';
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
 
  // standard way
  var update = {
    $set: { 
      'comment': 'Logged in.',
      'system': 'demo',
      'account.attempts': 0
    },
    $currentDate: {
      'login.date': true
    },
    $inc: {
      'analytics.visits': 1,
      'account.logins': 1,
    },
    $unset: {
      'account.blocked'
    }
  } 
  updateUser(db, update, function(err, res){
    db.close(); 
  })
  
  // using mongo-dot-notation
  var update = {
    comment: 'Logged in.',
    system: 'demo',
    login: {
      date: $.$currentDate()
    },
    analytics: {
      visits: $.$inc()
    },
    account: {
      blocked: $.$unset(),
      attempts: 0,
      logins: $.$inc()
    }
  }
  updateUser(db, $.flatten(update), function(err, res){
    db.close(); 
  })
});

function updateUser(db, user, handler){
  var collection = db.collection('users');
  collection.update({username: 'johndoe@test.com'}, user, handler);
}
```

The current implementation supports all mongo update operators: 
* $inc 
* $mul 
* $rename 
* $setOnInsert 
* $set 
* $unset 
* $min 
* $max
* $currentDate
 * use $currentDate for conversion to $type = 'date'
 * use $timestamp for conversion to $type = 'timestamp'

### Installation

Install from npm:
```
  npm install mongo-dot-notation --save
```

## Usage
### Convert a simple object

```javascript
var $ = require('mongo-dot-notation');

var person = {
  firstName: 'John',
  lastName: 'Doe'
};

var instructions = $.flatten(person)
console.log(instructions);
/* 
{
  $set: {
    'firstName': 'John',
    'lastName': 'Doe'
  }
}
*/
```

### Convert an object with deep properties

```javascript
var $ = require('mongo-dot-notation');

var person = {
  firstName: 'John',
  lastName: 'Doe',
  address: {
    city: 'NY',
    street: 'Eighth Avenu',
    number: 123
  }
};

var instructions = $.flatten(person)
console.log(instructions);
/* 
{
  $set: {
    'firstName': 'John',
    'lastName': 'Doe',
    'address.city': 'NY',
    'address.street': 'Eighth Avenu',
    'address.number': 123
  }
}
*/
```

### Using operators
```javascript
var $ = require('mongo-dot-notation');

var person = {
  password: '1234',
  updated: $.$currentDate(),
  resetCounter: $.$inc()
};

var instructions = $.flatten(person)
console.log(instructions);
/* 
{
  $set: {
    'password': '1234'
  },
  $inc: {
    'resetCounter': 1
  },
  $currentDate: {
    'updated': { $type: 'date'},
  }
}
*/
```

Operators can also be used in inner objects:
```javascript
var $ = require('mongo-dot-notation');

var pos = {
  coords: {
    x: $.$mul(2),
    y: $.$inc(10),
    z: $.$unset(),
    mark: [1, 2, 3]
  },
  label: $.$rename('title')
};

var instructions = $.flatten(pos)
console.log(instructions);
/* 
{
  $set: {
    'coords.mark': [1, 2, 3]
  },
  $mul: {
    'coords.x': 2
  },
  $inc: {
    'coords.y': 10
  },
  $unset: {
    'coords.z': ''
  },
  $rename: {
    'label': 'title'
  }
}
*/
```

Operators cannot be used inside arrays.

## Update operators signatures

See [MongoDB - Fields update operators](https://docs.mongodb.com/manual/reference/operator/update/#fields).

```javascript
var $ = require('mongo-dot-notation');

// $.$inc(value) increment value, defaults to 1
// $.$mul(value) multiply factor, defaults to 1
// $.$rename(name) renames a field with a given name
// $.$setOnInsert(value) sets the value only when inserted
// $.$set(value) sets the value. This is an implicit operator, meaning:
//    {a: 1} and {a: $set(1)} are equivalent  
// $.$unset() removes the field
// $.$min(value) only updates the field if the specified value is less than the existing field value
// $.$max(value) only updates the field if the specified value is greater than the existing field value
// $.$currentDate() sets the value of a field to current date as a Date
// $.$currentDate(type) where type=<date|timestamp> sets the value of a field to current date or timestamp
// $.$timestamp() sets the value of a field to current date as a Timestamp
```

> Copyright © 2015-2017 Dumitru Deveatii, released under the MIT license
