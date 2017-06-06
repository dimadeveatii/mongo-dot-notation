'use strict';

var operator = require('./operator').create;

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#fields
module.exports.$set = x => operator('$set').value(x);
module.exports.$inc = x => operator('$inc').value(typeof(x) === 'undefined' ? 1 : x);
module.exports.$max = x => operator('$max').value(x);
module.exports.$min = x => operator('$min').value(x);
module.exports.$mul = x => operator('$mul').value(typeof(x) === 'undefined' ? 1 : x);
module.exports.$rename = x => operator('$rename').value(x);
module.exports.$setOnInsert = x => operator('$setOnInsert').value(x);
module.exports.$unset = () => operator('$unset').value('');
module.exports.$currentDate = type => operator('$currentDate').value({$type: type || 'date'});
module.exports.$timestamp = () => operator('$currentDate').value({$type: 'timestamp'});