'use strict';

const field = require('./field');
const Operator = require('./operator');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update-array/#array-update-operators

module.exports.$ = x => new PositionalOperator(x);
module.exports.$addToSet = x => buildOperator(new AddToSetOperator(), x);
module.exports.$pop = x => buildOperator(new PopOperator(), x || 1);
module.exports.$pullAll = x => Operator.create('$pullAll', Array.isArray(x) ? x : [x]);
module.exports.$pull = x => Operator.create('$pull', Array.isArray(x) ? { '$in': x } : x);
module.exports.$push = x => buildOperator(new PushOperator(), x);
module.exports.$slice = x => buildOperator(new PushOperator(), []).$each().$slice(x);
module.exports.$sort = x => buildOperator(new PushOperator(), []).$each().$sort(x);

function buildOperator(operator, val) {
  operator.value(val);
  return operator;
}

class AddToSetOperator extends Operator {
  constructor() {
    super('$addToSet');
    this._each = false;
  }

  $each() {
    this._each = true;
    return this;
  }

  value(val) {
    if (typeof(val) === 'undefined' && this._each){
      const result = super.value();
      return { '$each': Array.isArray(result) ? result : [result] };
    }
  
    return super.value(val);
  }
}


class PopOperator extends Operator {
  constructor() {
    super('$pop');
    this._value = 1;
  }

  first() {
    return this.value(-1);
  }

  last() {
    return this.value(1);
  }
}

class PushOperator extends Operator {
  constructor() {
    super('$push');
    this._each = false;
    this._slice = null;
    this._sort = null;
    this._position = null;
  }

  value(val){
    if (typeof (val) !== 'undefined' || !this._each){
      return super.value(val);
    }
  
    const data = {
      '$each': typeof (this._value) === 'undefined' ? [] :
        (Array.isArray(this._value) ? this._value : [this._value])
    };

    if (this._sort !== null) {
      data['$sort'] = this._sort;
    }

    if (this._slice !== null) {
      data['$slice'] = this._slice;
    }

    if (this._position !== null) {
      data['$position'] = this._position;
    }

    return data;
  }

  $each(){
    this._each = true;
    return this;
  }

  $slice(count){
    if (!this._each) {
      throw new Error('$slice operator is available only when using $each.');
    }

    if (typeof (count) !== 'undefined') {
      this._slice = count;
    }

    return this;
  }
  
  $sort(specification){
    if (!this._each) {
      throw new Error('$sort operator is available only when using $each.');
    }

    this._sort = typeof(specification) === 'undefined' ? 1 : specification;
    return this;
  }

  $position(index){
    if (!this._each) {
      throw new Error('$position operator is available only when using $each.');
    }
    
    if (typeof (index) !== 'undefined') {
      this._position = index;
    }

    return this;
  }
}

class PositionalOperator extends Operator {
  constructor(field) {
    if (typeof (field) === 'number' || field && /\d+/.test(field)) {
      super(field + '');
    } else {
      super('$' + (field ? '.' + field : ''));
    }
  }

  value(val){
    if (typeof(val) === 'undefined'){
      if (!this._operator) {
        throw Error('Value is mandatory for positional operator.');
      }

      return this._operator;
    }
    
    if (Operator.isOperator(val)){
      if (!isValidPositionalOperator(val))
        throw new Error(val.name + ' operator is not supported with $ positional operator.');
      this._operator = val;
    }
    else{
      this._operator = field.$set(val);
    }
    
    return this;
  }
}

PositionalOperator._SupportedOperators = 
  ['$inc', '$mul', '$set', '$unset', '$min', '$max', '$currentDate', '$timestamp'];

PositionalOperator._SupportedOperators.forEach((name) => {
  PositionalOperator.prototype[name] = function(){
    return this.value(field[name].apply(null, arguments));
  };
});

function isValidPositionalOperator(operator){
  return PositionalOperator._SupportedOperators.indexOf(operator.name) > -1;
}