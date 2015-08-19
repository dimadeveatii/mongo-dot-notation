'use strict'

function $rename(alias) {
  this._value = alias
}

$rename.prototype.value = function () { return this._value }

module.exports = function (alias) {
  return new $rename(alias)
}