'use strict'

function $unset() {
}

$unset.prototype.value = function () { return '' }

module.exports = function () {
  return new $unset()
}