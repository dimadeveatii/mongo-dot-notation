'use strict'

function $mul(value) {
  if (isNaN(Number(value))) value = 1
  this._value = value
}

$mul.prototype.value = function () { return this._value }

module.exports = function (value) {
  return new $mul(value)
}