'use strict';

var util = require('util');
var Operator = require('./operator');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#bitwise
module.exports.$bit = function(){ return new BitOperator(); };
module.exports.$and = function(x){ return new BitOperator().$and(x); };
module.exports.$or = function(x){ return new BitOperator().$or(x); };
module.exports.$xor = function(x){ return new BitOperator().$xor(x); };

function BitwiseOperator(operation){
  Operator.call(this, '$bit');
  this._operation = operation;
}
util.inherits(BitwiseOperator, Operator);

BitwiseOperator.prototype.value = function(val){
  if (typeof (val) !== 'undefined'){
    return Operator.prototype.value.call(this, val);
  }
  
  var result = {};
  result[this._operation] = Operator.prototype.value.call(this);
  return result;
};

function BitOperator(){
  Operator.call(this, '$bit');
}
util.inherits(BitOperator, Operator);

BitOperator.prototype.value = function(){
  throw new Error('Value not supported when bitwise operation not set. Use $and, $or or $xor.');
};

BitOperator.prototype.$and = function(value){
  return new BitwiseOperator('and').value(value);
};

BitOperator.prototype.$or = function(value){
  return new BitwiseOperator('or').value(value);
};

BitOperator.prototype.$xor = function(value){
  return new BitwiseOperator('xor').value(value);
};