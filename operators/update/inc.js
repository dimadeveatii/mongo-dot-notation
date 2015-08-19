'use strict'

function $inc(value){
  if (isNaN(Number(value))) value = 1
  this._value = value
}

$inc.prototype.value = function (){ return this._value }

module.exports = function (value) {
  return new $inc(value)
}
