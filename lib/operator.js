'use strict';

function Operator(name){
  this.name = name;
}

Operator.prototype.value = function(val){
  if (typeof(val) === 'undefined')
    return this._value;

  this._value = val;
  return this;
};

module.exports.create = function(name){ return new Operator(name); };
module.exports.isOperator = function(obj){ return obj && obj instanceof Operator; };