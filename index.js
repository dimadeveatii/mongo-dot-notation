'use strict'

var util = require('util')

var KnownOperators = ['$inc', '$mul', '$rename', '$setOnInsert', '$set', '$unset', '$min', '$max', '$currentDate', '$timestamp']
var PrimitiveTypes = ['number', 'boolean', 'string']

module.exports.Operators = require('./operators/update')

module.exports.flatten = function (value) {
  if (!value || isPrimitive(value)) return value

  var obj = {}
  flatten(obj, null, value)
  return obj
}

function flatten(parent, prefix, child) {
  if (isPrimitive(child)) {
    if (!parent.$set) parent.$set = {}
    parent.$set[prefix] = child
    return
  }

  if (isOperator(child)) {
    var operator = operatorName(child)
    if (!parent[operator]) parent[operator] = {}
    parent[operator][prefix] = child.value()
    return
  }

  var keys = Object.keys(child)
  if (!keys.length) {
    if (prefix) {
      if (!parent.$set) parent.$set = {}
      parent.$set[prefix] = child
    }
    return
  }

  keys.forEach(function (key) {
    var newPrefix = !prefix ? key : (prefix + '.' + key)
    flatten(parent, newPrefix, child[key])
  })
}

function isPrimitive(value) {
  return PrimitiveTypes.indexOf(typeof (value)) !== -1 ||
    util.isArray(value) ||
    util.isDate(value) ||
    value === null ||
	value.constructor.name === 'ObjectID'
}

function isOperator(value) {
  var operator = operatorName(value)
  return KnownOperators.indexOf(operator) !== -1
}

function operatorName(operator) {
  return operator.constructor.name
}
