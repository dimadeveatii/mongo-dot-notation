'use strict'

function $max(value) {
  this._value = value
}

$max.prototype.value = function () { return this._value }


module.exports = function (value) {
  return new $max(value)
}