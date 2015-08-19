'use strict'

function $min(value) {
  this._value = value
}

$min.prototype.value = function () { return this._value }

module.exports = function (value) {
  return new $min(value)
}