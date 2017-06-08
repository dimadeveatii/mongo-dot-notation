'use strict';

var fieldOperators = require('./lib/fields'); 
var arrayOperators = require('./lib/arrays'); 

module.exports.isOperator = require('./lib/operator').isOperator;
module.exports.flatten = require('./lib/flatten');

// copy all field operators
Object.keys(fieldOperators).forEach(function(operator){
  module.exports[operator] = fieldOperators[operator];
});

// copy all array operators
Object.keys(arrayOperators).forEach(function(operator){
  module.exports[operator] = arrayOperators[operator];
});

/*
* @deprecated since version 1.1. Access operators directly.
*/
module.exports.Operators = fieldOperators;