mongo-dot-notation
========
Convert simple objects to mongo update operators. <br/>

This lightweight library can be used to create a more readable code when working with mongo updates. 
You focus on updated properties of the document, rather than on mongo update instructions.
##### Example:
```javascript
var dot = require('mongo-dot-notation');
var flatten = dot.flatten;
var op = dot.Operators;

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
      date: op.$currentDate()
    },
    analytics: {
      visits: op.$inc()
    },
    account: {
      blocked: op.$unset(),
      attempts: 0,
      logins: op.$inc()
    }
  }
  updateUser(db, flatten(update), function(err, res){
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
var dot = require('mongo-dot-notation');

var person = {
  firstName: 'John',
  lastName: 'Doe'
};

var instructions = dot.flatten(person)
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
var dot = require('mongo-dot-notation');

var person = {
  firstName: 'John',
  lastName: 'Doe',
  address: {
    city: 'NY',
    street: 'Eighth Avenu',
    number: 123
  }
};

var instructions = dot.flatten(person)
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
var dot = require('mongo-dot-notation');
var $inc = dot.Operators.$inc;
var $currentDate = dot.Operators.$currentDate;

var person = {
  password: '1234',
  updated: $currentDate(),
  resetCounter: $inc()
};

var instructions = dot.flatten(person)
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
var dot = require('mongo-dot-notation');
var op = dot.Operators;

var pos = {
  coords: {
    x: op.$mul(2),
    y: op.$inc(10),
    z: op.$unset(),
    mark: [1, 2, 3]
  },
  label: op.$rename('title')
};

var instructions = dot.flatten(pos)
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
```javascript
var dot = require('mongo-dot-notation');
var op = dot.Operators;

// op.$inc(value) increment value, defaults to 1
// op.$mul(value) multiply factor, defaults to 1
// op.$rename(name) renames a field with a given name
// op.$setOnInsert(value) sets the value only when inserted
// op.$set(value) sets the value. This is an implicit operator, meaning:
//    {a: 1} and {a: $set(1)} are equivalent  
// op.$unset() removes the field
// op.$min(value) only updates the field if the specified value is less than the existing field value
// op.$max(value) only updates the field if the specified value is greater than the existing field value
// op.$currentDate() sets the value of a field to current date as a Date
// op.$timestamp() sets the value of a field to current date as a Timestamp
```

> Copyright © 2015 Dumitru Deveatii, released under the MIT license
