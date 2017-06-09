'use strict';

var Operator = require('./operator');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#fields
module.exports.$set = function(value){ return Operator.create('$set', value); };
module.exports.$inc = function(value){ return Operator.create('$inc', value, 1); };
module.exports.$max = function(value){ return Operator.create('$max', value); };
module.exports.$min = function(value){ return Operator.create('$min', value); };
module.exports.$mul = function(value){ return Operator.create('$mul', value, 1); };
module.exports.$rename = function(field){ return Operator.create('$rename', field); };
module.exports.$setOnInsert = function(value){ return Operator.create('$setOnInsert', value); };
module.exports.$unset = function(){ return Operator.create('$unset', ''); };
module.exports.$currentDate = function(type) { return Operator.create('$currentDate', {$type: type || 'date'}); };
module.exports.$timestamp = function(){ return Operator.create('$currentDate', {$type: 'timestamp'}); };