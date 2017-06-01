'use strict'

function $timestamp() {
    this.name = '$currentDate'
}

$timestamp.prototype.value = function () { return { $type: 'timestamp' } }

module.exports = function () {
  return new $timestamp()
}