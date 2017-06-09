'use strict';

var Benchmark = require('benchmark');
var $ = require('../index');

var suite = new Benchmark.Suite;

suite.add('flatten # empty', function() {
  $.flatten();
})
.add('flatten # scalar', function() {
  $.flatten(100);
})
.add('flatten # simple object', function() {
  $.flatten({name: 'John', city: 'NY'});
})
.add('flatten # nested object', function() {
  $.flatten({name: 'John', city: 'NY', contact: { phone: 13245, email: 'test@test.com'}});
})
.add('flatten # nested object with operators', function() {
  $.flatten({
      name: 'John', 
      city: 'NY', 
      visits: $.$inc(),
      scores: $.$('std').$set(0),
      updatedOn: $.$currentDate(),
      operations: $.$push('open'),
      contact: { 
          phone: 13245, 
          email: 'test@test.com',
          fax: $.$unset(),
          mobile: $.$rename('mobilePhone')
        }
    });
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': false });