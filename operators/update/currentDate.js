'use strict'

function $currentDate() {
}

$currentDate.prototype.value = function () { return { $type: 'date'} }

module.exports = function (){
  return new $currentDate()
}