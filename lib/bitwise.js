'use strict';

const Operator = require('./operator');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#bitwise

module.exports.$bit = function(){ return new BitOperator(); };
module.exports.$and = function(x){ return new BitOperator().$and(x); };
module.exports.$or = function(x){ return new BitOperator().$or(x); };
module.exports.$xor = function(x){ return new BitOperator().$xor(x); };

class BitwiseOperator extends Operator {
  constructor(operation) {
    super('$bit');
    this._operation = operation;
  }

  value(val){
    if (typeof (val) !== 'undefined'){
      return super.value(val);
    }

    const result = {};
    result[this._operation] = super.value();
    return result;
  }
}

class BitOperator extends Operator {
  constructor() {
    super('$bit');
  }

  value() {
    throw new Error('Value not supported when bitwise operation not set. Use $and, $or or $xor.');
  }

  $and(value){
    return new BitwiseOperator('and').value(value);
  }

  $or(value){
    return new BitwiseOperator('or').value(value);
  }
  
  $xor(value){
    return new BitwiseOperator('xor').value(value);
  }
}
