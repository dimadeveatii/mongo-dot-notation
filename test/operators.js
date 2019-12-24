'use strict';

const expect = require('chai').expect;
const $ = require('../index');
const Operator = require('../lib/operator');

describe('# Internals', () => {
  describe('# Operator', () => {
    it('Defines isOperator methods', () => {
      Operator.should.itself.respondTo('isOperator');
    });

    it('When null name throws', () => {
      expect(() => { new Operator(); }).to.throw();
    });

    it('Name is set', () => {
      new Operator('inc').should.have.property('name').
        that.equals('inc');
    });

    it('When value not set defaults to undefined', () => {
      expect(new Operator('test').value()).to.be.undefined;
    });

    it('When value set to null returns null value', () => {
      expect(new Operator('test').value(null).value()).to.be.null;
    });

    it('When value set returns same value', () => {
      const val = {};
      new Operator('test').value(val).value().should.equal(val);
    });

    it('When value set chains self', () => {
      const op = new Operator('test');
      op.value({}).should.equal(op);
    });
  });
});

describe('# Update operators', () => {
  describe('# Field', () => {

    describe('$inc', () => {
      it('Is operator', () => {
        $.isOperator($.$inc()).should.be.true;
      });
      
      it('Has $inc name', () => {
        $.$inc().name.should.equal('$inc');
      });
      
      it('When argument is undefined defaults to 1', () => {
        $.$inc().value().should.equal(1);
      });

      it('When argument is set uses its value', () => {
        const value = 123;
        $.$inc(value).value().should.equal(value);
      });
    });

    describe('$mul', () => {
      it('Is operator', () => {
        $.isOperator($.$mul()).should.be.true;
      });
      
      it('Has $mul name', () => {
        $.$mul().name.should.equal('$mul');
      });
      
      it('When argument is undefined defaults to 1', () => {
        $.$mul().value().should.equal(1);
      });

      it('When argument is set uses its value', () => {
        const value = 10;
        $.$mul(value).value().should.equal(value);
      });
    });

    describe('$rename', () => {
      it('Is operator', () => {
        $.isOperator($.$rename('field')).should.be.true;
      });
      
      it('Has $rename name', () => {
        $.$rename('field').name.should.equal('$rename');
      });
      
      it('Has expected value', () => {
        const value = 'test';
        $.$rename(value).value().should.equal(value);
      });
    });

    describe('$setOnInsert', () => {
      it('Is operator', () => {
        $.isOperator($.$setOnInsert(1)).should.be.true;
      });
      
      it('Has $setOnInsert name', () => {
        $.$setOnInsert(10).name.should.equal('$setOnInsert');
      });

      it('Has expected value', () => {
        const value = {x: 10, y: 20};
        $.$setOnInsert(value).value().should.equal(value);
      });
    });

    describe('$set', () => {
      it('Is operator', () => {
        $.isOperator($.$set(1)).should.be.true;
      });
      
      it('Has $set name', () => {
        $.$set(10).name.should.equal('$set');
      });
      
      it('Has expected value', () => {
        const value = { x: 10, y: 20 };
        $.$set(value).value().should.equal(value);
      });
    });

    describe('$unset', () => {
      it('Is operator', () => {
        $.isOperator($.$unset()).should.be.true;
      });
      
      it('Has $unset name', () => {
        $.$unset().name.should.equal('$unset');
      });
      
      it('Has empty string value', () => {
        $.$unset().value().should.equal('');
      });
    });

    describe('$min', () => {
      it('Is operator', () => {
        $.isOperator($.$min(1)).should.be.true;
      });
      
      it('Has $min name', () => {
        $.$min(1).name.should.equal('$min');
      });
      
      it('Has expected value', () => {
        const value = 10;
        $.$min(value).value().should.equal(value);
      });
    });

    describe('$max', () => {
      it('Is operator', () => {
        $.isOperator($.$max(1)).should.be.true;
      });
      
      it('Has $max name', () => {
        $.$max(1).name.should.equal('$max');
      });
      
      it('Has expected value', () => {
        const value = 10;
        $.$max(value).value().should.equal(value);
      });
    });

    describe('$currentDate', () => {
      it('Is operator', () => {
        $.isOperator($.$currentDate()).should.be.true;
      });
      
      it('Has $currentDate name', () => {
        $.$currentDate().name.should.equal('$currentDate');
      });
      
      it('When argument is undefined defaults to date type', () => {
        $.$currentDate().value().should.be.deep.equal({ $type: 'date' });
      });

      it('When argument is set uses its value', () => {
        $.$currentDate('timestamp').value()
          .should.be.deep.equal({ $type: 'timestamp' });
      });
    });

    describe('$timestamp *', () => {
      it('Is operator', () => {
        $.isOperator($.$timestamp()).should.be.true;
      });
      
      it('Has $currentDate name', () => {
        $.$timestamp().name.should.equal('$currentDate');
      });
      
      it('Has timestamp type value', () => {
        $.$timestamp().value().should.be.deep.equal({ $type: 'timestamp' });
      });
    });
  });
  
  describe('# Array', () => {
    describe('$', () => {
      it('Is operator', () => {
        $.isOperator($.$()).should.be.true;
      });
      
      it('Has $ name when no field specified', () => {
        $.$().name.should.equal('$');
      });
      
      it('Appends field to name when field specified', () => {
        $.$('std').name.should.equal('$.std');
      });
      
      it('Appends index when number specified', () => {
        $.$(3).name.should.equal('3');
      });

      it('Appends index when string number specified', () => {
        $.$('3').name.should.equal('3');
      });

      it('Appends index with field when mathes number', () => {
        $.$('3.std').name.should.equal('3.std');
      });

      it('Appends index with field when mathes 0', () => {
        $.$('0.std').name.should.equal('0.std');
      });

      it('Value throws when not set', () => {
        expect(() => { $.$().value(); }).to.throw();
      });
      
      it('Value throws when not supported operator is set', () => {
        expect(() => { $.$().value($.$setOnInsert(10)); }).to.throw(/setOnInsert/);
      });
      
      it('When value set defaults to $set', () => {
        $.$().value(101).value().value().should.equal(101);
      });
      
      it('When value set with $set with null', () => {
        expect($.$().value($.$set(null)).value().value()).to.be.null;
      });
      
      it('When value set to null', () => {
        const operator = $.$unset();
        expect($.$().value($.$set(null)).value().value()).to.be.null;
      });
      
      it('When value set with operator returns operator', () => {
        const operator = $.$unset();
        $.$().value(operator).value().should.equal(operator);
      });
      
      it('When chained operator', () => {
        $.$().$inc(10).value().should.have.property('name').that.equals('$inc');
      });
      
      it('Is chainable with $inc', () => {
        $.$().should.respondTo('$inc');
      });
      
      it('Is chainable with $mul', () => {
        $.$().should.respondTo('$mul');
      });
      
      it('Is chainable with $set', () => {
        $.$().should.respondTo('$set');
      });
      
      it('Is chainable with $unset', () => {
        $.$().should.respondTo('$unset');
      });
      
      it('Is chainable with $min', () => {
        $.$().should.respondTo('$min');
      });
      
      it('Is chainable with $max', () => {
        $.$().should.respondTo('$max');
      });
      
      it('Is chainable with $currentDate', () => {
        $.$().should.respondTo('$currentDate');
      });
      
      it('Is chainable with $timestamp', () => {
        $.$().should.respondTo('$timestamp');
      });
    });
    
    describe('$addToSet', () => {
      it('Is operator', () => {
        $.isOperator($.$addToSet(1)).should.be.true;
      });
      
      it('Has $addToSet name', () => {
        $.$addToSet(1).name.should.equal('$addToSet');
      });
      
      it('When is null value', () => {
        expect($.$addToSet(null).value()).to.be.null;
      });
      
      it('When is scalar value', () => {
        const value = 10;
        $.$addToSet(value).value().should.equal(value);
      });

      it('When is null value with each', () => {
        $.$addToSet(null).$each().value().should.deep.equal({ '$each': [null] });
      });
      
      it('When is array value', () => {
        const value = [1, 2, 3];
        $.$addToSet(value).value().should.equal(value);
      });
      
      it('When is scalar value with each', () => {
        const value = 10;
        $.$addToSet(value).$each().value().should.deep.equal({ '$each': [10] });
      });
      
      it('When is array value with each', () => {
        const value = [1, 2, 3];
        $.$addToSet(value).$each().value().should.deep.equal({ '$each': [1, 2, 3] });
      });
    });
    
    describe('$pop', () => {
      it('Is operator', () => {
        $.isOperator($.$pop(1)).should.be.true;
      });
      
      it('Has $pop name', () => {
        $.$pop(1).name.should.equal('$pop');
      });
      
      it('When direction not specified uses 1 by default', () => {
        $.$pop().value().should.equal(1);
      });
      
      it('When direction is 1 uses 1', () => {
        $.$pop(1).value().should.equal(1);
      });
      
      it('When direction is -1 uses -1', () => {
        $.$pop(-1).value().should.equal(-1);
      });
      
      it('When chained with first uses -1', () => {
        $.$pop().first().value().should.equal(-1);
      });
      
      it('When chained with last uses 1', () => {
        $.$pop().last().value().should.equal(1);
      });
    });
    
    describe('$pullAll', () => {
      it('Is operator', () => {
        $.isOperator($.$pullAll(1)).should.be.true;
      });
      
      it('Has $pullAll name', () => {
        $.$pullAll(1).name.should.equal('$pullAll');
      });
      
      it('When null value specified returns array of null element', () => {
        $.$pullAll(null).value().should.deep.equal([null]);
      });
      
      it('When empty array specified returns empty array', () => {
        $.$pullAll([]).value().should.deep.equal([]);
      });
      
      it('When value specified returns array of value element', () => {
        const value = 'Test';
        $.$pullAll(value).value().should.deep.equal([value]);
      });
      
      
      it('When array specified returns array', () => {
        const value = [1, 2, 3];
        $.$pullAll(value).value().should.deep.equal(value);
      })
    });
    
    describe('$pull', () => {
      it('Is operator', () => {
        $.isOperator($.$pull(1)).should.be.true;
      });
      
      it('Has $pull name', () => {
        $.$pull(1).name.should.equal('$pull');
      });
      
      it('When null value specified returns null', () => {
        expect($.$pull(null).value()).to.equal(null);
      });
      
      it('When scalar value specified returns value', () => {
        const value = 100;
        $.$pull(value).value().should.to.equal(value);
      });
      
      it('When object value specified returns value', () => {
        const value = { score: 8, item: "B" };
        $.$pull(value).value().should.to.deep.equal(value);
      });
      
      it('When array value specified applies $in operator', () => {
        const value = ['A', 'B', 'C'];
        $.$pull(value).value().should.to.deep.equal({ '$in': value });
      });
    });

    describe('$push', () => {
      it('Is operator', () => {
        $.isOperator($.$push(1)).should.be.true;
      });
      
      it('Has $push name', () => {
        $.$push().name.should.equal('$push');
      });
      
      it('When null value specified returns null', () => {
        expect($.$push(null).value()).to.equal(null);
      });
      
      it('When undefined value specified returns undefined', () => {
        expect($.$push().value()).to.equal(undefined);
      });

      it('When scalar value specified returns value', () => {
        const value = 9;
        $.$push(value).value().should.equal(value);
      });
      
      it('When object value specified returns value', () => {
        const value = { data: 'test'};
        $.$push(value).value().should.deep.equal(value);
      });
      
      it('When array value specified returns array', () => {
        const value = [1, 2, 3];
        $.$push(value).value().should.deep.equal(value);
      });
      
      it('When no value specified with $each', () => {
        $.$push().$each().value().should.deep.equal({ '$each': []});
      });
      
      it('When scalar value specified with $each', () => {
        const value = 100;
        $.$push(value).$each().value().should.deep.equal({ '$each': [value]});
      });
      
      it('When array value specified with $each', () => {
        const value = [1, 2, 3];
        $.$push(value).$each().value().should.deep.equal({ '$each': value});
      });
      
      it('When using $slice without $each throws', () => {
        expect(() => { $.$push(10).$slice(1); }).to.throw(/\$slice/);
      });
      
      it('When using $slice with empty value is ignored', () => {
        $.$push(10).$each().$slice().value()
          .should.deep.equal({'$each': [10]});
      });
      
      it('When using $slice sets value', () => {
        $.$push(10).$each().$slice(-3).value()
          .should.deep.equal({'$each': [10], '$slice': -3});
      });
      
      it('When using $sort without $each throws', () => {
        expect(() => { $.$push(10).$sort(1); }).to.throw(/\$sort/);
      });
      
      it('When using $sort with empty value uses 1 by default', () => {
        $.$push(10).$each().$sort().value()
          .should.deep.equal({'$each': [10], '$sort': 1});
      });
      
      it('When using $sort sets value', () => {
        $.$push(10).$each().$sort({ val: 1 }).value()
          .should.deep.equal({'$each': [10], '$sort': { val: 1}});
      });
      
      it('When using $position without $each throws', () => {
        expect(() => { $.$push(10).$position(1); }).to.throw(/\$position/);
      });
      
      it('When using $position with empty value is ignored', () => {
        $.$push(10).$each().$position().value()
          .should.deep.equal({'$each': [10]});
      });
      
      it('When using $position sets value', () => {
        $.$push(10).$each().$position(0).value()
          .should.deep.equal({'$each': [10], '$position': 0});
      });
      
      it('When using $each, $slice, $sort and $position', () => {
        $.$push([{score: 9}, {score: 10}, {score: 7}])
          .$each()
          .$position(0)
          .$sort({score: -1})
          .$slice(3)
          .value()
          .should.deep.equal({
            '$each': [{score: 9}, {score: 10}, {score: 7}],
            '$sort': {score: -1},
            '$slice': 3,
            '$position': 0
          })
      });
    });
    
    describe('$slice *', () => {
      it('Is operator', () => {
        $.isOperator($.$slice(1)).should.be.true;
      });
      
      it('Has $push name', () => {
        $.$slice(1).name.should.equal('$push');
      });
      
      it('Is same as $push of empty array', () => {
        $.$slice(1).value().should.deep.equal({ '$each': [], '$slice': 1 });
      });
    });
    
    describe('$sort *', () => {
      it('Is operator', () => {
        $.isOperator($.$sort(1)).should.be.true;
      });
      
      it('Has $push name', () => {
        $.$sort(1).name.should.equal('$push');
      });
      
      it('Is same as $push of empty array', () => {
        $.$sort(1).value().should.deep.equal({ '$each': [], '$sort': 1 });
      });
    });
  });
  
  describe('# Bitwise', () => {
    describe('$bit', () => {
      it('Is operator', () => {
        $.isOperator($.$bit()).should.be.true;
      });
      
      it('Has $bit name', () => {
        $.$bit().name.should.equal('$bit');
      });
      
      it('Is chainable with $and', () => {
        $.$bit().should.respondTo('$and');
      });
      
      it('When chained with $and sets value', () => {
        $.$bit().$and(1).value().should.deep.equal({ 'and': 1 });
      });
      
      it('Is chainable with $or', () => {
        $.$bit().should.respondTo('$or');
      });
      
      it('When chained with $or sets value', () => {
        $.$bit().$or(1).value().should.deep.equal({ 'or': 1 });
      });
      
      it('Is chainable with $xor', () => {
        $.$bit().should.respondTo('$xor');
      });
      
      it('When chained with $or sets value', () => {
        $.$bit().$xor(1).value().should.deep.equal({ 'xor': 1 });
      });
      
      it('Value throws', () => {
        expect(() => { $.$bit().value(); }).to.throw();
      });
    });
    
    describe('$and *', () => {
      it('Is operator', () => {
        $.isOperator($.$and(5)).should.be.true;
      });
      
      it('Has $bit name', () => {
        $.$and(5).name.should.equal('$bit');
      });
      
      it('When value provided', () => {
        $.$and(5).value().should.deep.equal({ 'and': 5 });
      });
    });
    
    describe('$or *', () => {
      it('Is operator', () => {
        $.isOperator($.$or(5)).should.be.true;
      });
      
      it('Has $bit name', () => {
        $.$or(5).name.should.equal('$bit');
      });
      
      it('When value provided', () => {
        $.$or(5).value().should.deep.equal({ 'or': 5 });
      });
    });
    
    describe('$xor *', () => {
      it('Is operator', () => {
        $.isOperator($.$xor(5)).should.be.true;
      });
      
      it('Has $bit name', () => {
        $.$xor(5).name.should.equal('$bit');
      });
      
      it('When value provided', () => {
        $.$xor(5).value().should.deep.equal({ 'xor': 5 });
      });
    });
  });
});