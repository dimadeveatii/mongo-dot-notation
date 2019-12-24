'use strict';

const Operator = require('./operator');

// MongoDB Update field operators
// https://docs.mongodb.com/manual/reference/operator/update/#fields

module.exports.$set = value => Operator.create('$set', value);
module.exports.$inc = value => Operator.create('$inc', value, 1);
module.exports.$max = value => Operator.create('$max', value);
module.exports.$min = value => Operator.create('$min', value);
module.exports.$mul = value => Operator.create('$mul', value, 1);
module.exports.$rename = field => Operator.create('$rename', field);
module.exports.$setOnInsert = value => Operator.create('$setOnInsert', value);
module.exports.$unset = () => Operator.create('$unset', '');
module.exports.$currentDate = type => Operator.create('$currentDate', {$type: type || 'date'});
module.exports.$timestamp = () => Operator.create('$currentDate', { $type: 'timestamp' });
