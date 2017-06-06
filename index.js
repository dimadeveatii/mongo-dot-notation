'use strict';

var fieldOperators = require('./lib/fields'); 

module.exports.isOperator = require('./lib/operator').isOperator;
module.exports.flatten = require('./lib/flatten');

// copy all field operators
Object.keys(fieldOperators).forEach(function(operator){
  module.exports[operator] = fieldOperators[operator];
});

/*
* @deprecated since version 1.1. Access operators directly.
*/
module.exports.Operators = fieldOperators;