'use strict';

var util = require('util');
var Operator = require('./operator');

var PrimitiveTypes = [
  'number',
  'string',
  'boolean',
  'symbol'
];

var BsonTypes = [
  'Binary',
  'Code',
  'DBRef',
  'Decimal128',
  'Double',
  'Int32',
  'Long',
  'MaxKey',
  'MinKey',
  'ObjectID',
  'BSONRegExp',
  'Symbol',
  'Timestamp'
];

module.exports = function(value) { 
  return flatten({}, null, value); 
};

function flatten(updateData, propertyName, propertyValue) {
  if (isLeaf(propertyValue)) {
    return propertyName ? 
      build(updateData, '$set', propertyName, propertyValue) : propertyValue;
  }

  if (Operator.isOperator(propertyValue)) {
    return build(updateData, propertyValue.name, 
                 propertyName, propertyValue.value());
  }

  var keys = Object.keys(propertyValue);
  if (!keys.length) {
    return propertyName ? 
      build(updateData, '$set', propertyName, propertyValue) : updateData;
  }

  for(var i = 0; i < keys.length; i++){
    var key = keys[i];
    var newPrefix = !propertyName ? key : (propertyName + '.' + key);
    flatten(updateData, newPrefix, propertyValue[key]);
  }
  
  return updateData;
}

function build(updateData, operator, propertyName, value) {
  if (Operator.isOperator(value))
    return build(updateData, value.name, propertyName + '.' + operator, value.value());
  
  updateData[operator] = updateData[operator] || {};
  updateData[operator][propertyName] = value;
  
  return updateData;
}

function isLeaf(value) {
  return value === null ||
         typeof(value) === 'undefined' ||
         isPrimitive(value) ||
         isBsonType(value);
}

function isPrimitive(value) {
  return PrimitiveTypes.indexOf(typeof (value)) > -1 ||
         util.isArray(value) ||
         util.isDate(value);
}

function isBsonType(value) {
  return value._bsontype && 
         BsonTypes.indexOf(value._bsontype) > -1;
}