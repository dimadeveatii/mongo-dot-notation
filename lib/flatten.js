'use strict';

const Operator = require('./operator');

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
  'ObjectId',
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

  const keys = Object.keys(propertyValue);
  if (!keys.length) {
    return propertyName ? 
      build(updateData, '$set', propertyName, propertyValue) : updateData;
  }

  for(let i = 0, n = keys.length; i < n; i++){
    const key = keys[i];
    const newPrefix = !propertyName ? key : (propertyName + '.' + key);
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
         Array.isArray(value) ||
         value instanceof Date;
}

function isBsonType(value) {
  return value._bsontype && 
         BsonTypes.indexOf(value._bsontype) > -1;
}