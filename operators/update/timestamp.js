'use strict'

function $timestamp() {
}

$timestamp.prototype.value = function () { return { $type: 'timestamp' } }

module.exports = function () {
  return new $timestamp()
}