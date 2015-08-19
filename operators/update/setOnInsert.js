'use strict'

function $setOnInsert(value) {
  this._value = value
}

$setOnInsert.prototype.value = function () { return this._value }

module.exports = function (value) {
  return new $setOnInsert(value)
}