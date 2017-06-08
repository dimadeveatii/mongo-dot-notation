'use strict';

var util = require('util');
var operator = require('./operator').create;
var isOperator = require('./operator').isOperator;
var fieldOperators = require('./fields');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update-array/#array-update-operators

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

function AddToSetOperator(){
  this.name = '$addToSet';
  this._operator = operator('$addToSet');
  this._each = false;
}

AddToSetOperator.prototype.$each = function(){
  this._each = true;
  return this;
};

AddToSetOperator.prototype.value = function(val){
  if (typeof(val) !== 'undefined'){
    this._operator.value(val);
    return this;
  }

  if (!this._each)
    return this._operator.value();
  
  var data = this._operator.value();
  return { '$each': util.isArray(data) ? data : [data] };
};

function PopOperator(){
  this.name = '$pop';
}

PopOperator.prototype.value = function(val){
  if (typeof(val) === 'undefined'){
    return this._last ? 1 : -1;
  }
  
  this._last = val === -1 ? false : true;
  return this;
};

PopOperator.prototype.first = function(){
  this._last = false;
  return this;
};

PopOperator.prototype.last = function(){
  this._last = true;
  return this;
};

function PushOperator(){
  this.name = '$push';

  this._each = false;
  this._slice = null;
  this._sort = null;
  this._position = null;
}

PushOperator.prototype.value = function(val){
  if (typeof (val) !== 'undefined'){
    this._value = val;
    return this;
  }

  if (!this._each) return this._value;
  
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
  
  if (typeof(specification) !== 'undefined')
    this._sort = specification;
  return this;
};

PushOperator.prototype.$position = function(index){
  if (!this._each) 
    throw new Error('$position operator is available only when using $each.');
  
  if (typeof(index) !== 'undefined')
    this._position = index;
  return this;
};

function PositionalOperator(){
  this.name = '$';
  this.field = null;
}

(['$inc', '$mul', '$set', '$unset', '$min', '$max', '$currentDate', '$timestamp']).forEach(function(name){
  PositionalOperator.prototype[name] = function(){
    this._operator = fieldOperators[name](arguments);
  }
});

PositionalOperator.prototype.value = function(val){
  if (typeof(val) !== 'undefined'){
    if (isOperator(val)) this._operator = val;
    else this._operator = fieldOperators.$set(val);
    
    return this;
  }
  
  if (!this.operator)
    throw Error('Value is mandatory for positional operator.');

  return this._operator;  
}

