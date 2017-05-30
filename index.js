'use strict'

var util = require('util')

const PrimitiveTypes = [
  'number',
  'string',
  'boolean',
  'symbol'
];

const BsonTypes = [
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
]
const operators = require('./operators/update')
const isOperator = operators.isOperator;

// Added for backwards compatibility in versions < 1.1
module.exports.Operators = operators

Object.keys(operators).forEach(x => module.exports[x] = operators[x])

module.exports.flatten = value => flatten({}, null, value);

function flatten(updateData, propertyName, propertyValue) {
  if (isLeaf(propertyValue)) {
    return propertyName ? 
      build(updateData, '$set', propertyName, propertyValue) : propertyValue;
  }

  if (isOperator(propertyValue)) {
    return build(updateData, propertyValue.name, 
                 propertyName, propertyValue.value());
  }

  var keys = Object.keys(propertyValue);
  if (!keys.length) {
    return propertyName ? 
      build(updateData, '$set', propertyName, propertyValue) : updateData;
  }

  for(let i = 0; i < keys.length; i++){
    const key = keys[i];
    const newPrefix = !propertyName ? key : (propertyName + '.' + key)
    flatten(updateData, newPrefix, propertyValue[key])
  }
  
  return updateData
}

function build(updateData, operator, propertyName, value) {
    updateData[operator] = updateData[operator] || {};
    updateData[operator][propertyName] = value;

    return updateData
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
	return value._bsontype && BsonTypes.indexOf(value._bsontype) > -1
}
