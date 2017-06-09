'use strict';

module.exports = Operator;

function Operator(name){
  if (!name) 
    throw new Error('Null argument error: name');
  this.name = name;
}

Operator.prototype.value = function(val){
  if (typeof(val) === 'undefined')
    return this._value;

  this._value = val;
  return this;
};

Operator.isOperator = function(obj){ return obj && obj instanceof Operator; };
Operator.create = function(name, value, defaultValue){ 
  var operator = new Operator(name);
  operator.value(typeof(value) === 'undefined' ? defaultValue : value);
  return operator;
};