'use strict'

function $set(value) {
  this._value = value
}

$set.prototype.value = function () { return this._value }

module.exports = function (value) {
  return new $set(value)
}
