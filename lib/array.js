'use strict';

var util = require('util');

var fieldOperators = require('./field');
var op = require('./operator');
var Operator = op.Operator;
var operator = op.create;
var isOperator = op.isOperator;

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update-array/#array-update-operators
module.exports.$ = function(x){ return new PositionalOperator(x); };
module.exports.$addToSet = function(x){ return new AddToSetOperator().value(x); };
module.exports.$pop = function(x){ return new PopOperator().value(x || 1); };
module.exports.$pullAll = function(x){ return operator('$pullAll').value(util.isArray(x) ? x : [x]); };
module.exports.$pull = function(x){ return operator('$pull').value(util.isArray(x) ? { '$in': x } : x); };
module.exports.$pushAll = function(x){ return operator('$pushAll').value(x); };
module.exports.$push = function(x){ 
  var operator = new PushOperator();
  operator.value(x);
  return operator;
};

module.exports.$slice = function(x){ return module.exports.$push([]).$each().$slice(x); };
module.exports.$sort = function(x){ return module.exports.$push([]).$each().$sort(x); };

function AddToSetOperator(){
  Operator.call(this, '$addToSet');
  this._each = false;
}
util.inherits(AddToSetOperator, Operator);

AddToSetOperator.prototype.$each = function(){
  this._each = true;
  return this;
};

AddToSetOperator.prototype.value = function(val){
  if (typeof(val) === 'undefined' && this._each){
    var result = Operator.prototype.value.call(this);
    return { '$each': util.isArray(result) ? result : [result] };
  }

  return Operator.prototype.value.call(this, val);
};

function PopOperator(){
  Operator.call(this, '$pop');
  this._value = 1;
}
util.inherits(PopOperator, Operator);

PopOperator.prototype.first = function(){
  return this.value(-1);
};

PopOperator.prototype.last = function(){
  return this.value(1);
};

function PushOperator(){
  Operator.call(this, '$push');

  this._each = false;
  this._slice = null;
  this._sort = null;
  this._position = null;
}
util.inherits(PushOperator, Operator);

PushOperator.prototype.value = function(val){
  if (typeof (val) !== 'undefined' || !this._each){
    return Operator.prototype.value.call(this, val);
  }

  var data = {
    '$each': typeof(this._value) === 'undefined' ? [] : 
             (util.isArray(this._value) ? this._value : [this._value])
  };
  
  if (this._sort !== null)
    data['$sort'] = this._sort;
  
  if (this._slice !== null)
    data['$slice'] = this._slice;
  
  if (this._position !== null)
    data['$position'] = this._position;
  
  return data;
};

PushOperator.prototype.$each = function(){
  this._each = true;
  return this;
};

PushOperator.prototype.$slice = function(count){
  if (!this._each) 
    throw new Error('$slice operator is available only when using $each.');
  
  if (typeof(count) !== 'undefined')
    this._slice = count;
  return this;
};

PushOperator.prototype.$sort = function(specification){
  if (!this._each) 
    throw new Error('$sort operator is available only when using $each.');
  
  this._sort = typeof(specification) === 'undefined' ? 1 : specification;
  return this;
};

PushOperator.prototype.$position = function(index){
  if (!this._each) 
    throw new Error('$position operator is available only when using $each.');
  
  if (typeof(index) !== 'undefined')
    this._position = index;
  return this;
};

function PositionalOperator(field){
  Operator.call(this, '$' + (field ? '.' + field : ''));
}
util.inherits(PositionalOperator, Operator);

PositionalOperator._SupportedOperators = ['$inc', '$mul', '$set', '$unset', '$min', '$max', '$currentDate', '$timestamp'];

PositionalOperator._SupportedOperators.forEach(function(name){
  PositionalOperator.prototype[name] = function(){
    return this.value(fieldOperators[name].apply(null, arguments));
  };
});

PositionalOperator.prototype.value = function(val){
  if (typeof(val) === 'undefined'){
    if (!this._operator)
      throw Error('Value is mandatory for positional operator.');

    return this._operator;  
  }
  
  if (isOperator(val)){
    if (!isValidPositionalOperator(val))
      throw new Error(val.name + ' operator is not supported with $ positional operator.');
    this._operator = val;
  }
  else{
    this._operator = fieldOperators.$set(val);
  }
  
  return this;
};

function isValidPositionalOperator(operator){
  return PositionalOperator._SupportedOperators.indexOf(operator.name) > -1;
}