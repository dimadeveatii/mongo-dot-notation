'use strict';

class Operator{
  constructor(name) {
    if (!name) 
      throw new Error('Null argument error: name');
    this.name = name;
  }

  value(val){
    if (typeof(val) === 'undefined')
      return this._value;
  
    this._value = val;
    return this;
  }
}

Operator.isOperator = obj => obj instanceof Operator;
Operator.create = (name, value, defaultValue) => { 
  const operator = new Operator(name);
  operator.value(typeof(value) === 'undefined' ? defaultValue : value);
  return operator;
};

module.exports = Operator;
