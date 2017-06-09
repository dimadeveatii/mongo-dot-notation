'use strict';

module.exports.isOperator = require('./lib/operator').isOperator;
module.exports.flatten = require('./lib/flatten');

extend(require('./lib/field'));
extend(require('./lib/array'));
extend(require('./lib/bitwise'));

/*
* @deprecated since version 1.1. Access operators directly.
*/
module.exports.Operators = require('./lib/field');

function extend(operators){
  Object.keys(operators).forEach(function(operatorName){
    module.exports[operatorName] = operators[operatorName];
  });
}