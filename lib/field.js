'use strict';

var operator = require('./operator').create;

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#fields
module.exports.$set = function(x){ return operator('$set').value(x); };
module.exports.$inc = function(x){ return operator('$inc').value(typeof(x) === 'undefined' ? 1 : x); };
module.exports.$max = function(x){ return operator('$max').value(x); };
module.exports.$min = function(x){ return operator('$min').value(x); };
module.exports.$mul = function(x){ return operator('$mul').value(typeof(x) === 'undefined' ? 1 : x); };
module.exports.$rename = function(x){ return operator('$rename').value(x); };
module.exports.$setOnInsert = function(x){ return operator('$setOnInsert').value(x); };
module.exports.$unset = function(){ return operator('$unset').value(''); };
module.exports.$currentDate = function(type) { return operator('$currentDate').value({$type: type || 'date'}); };
module.exports.$timestamp = function(){ return operator('$currentDate').value({$type: 'timestamp'}); };