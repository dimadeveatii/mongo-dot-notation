import { create } from './operator';

/**
 * Replaces the value of a field with the specified value.
 * @param value replacement value
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/set/
 */
export const $set = <T>(value: T) => create('$set', value);

/**
 * Increments a field by a specified value.
 * @param value amount to increment by (default `1`)
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/inc/
 */
export const $inc = <T>(value?: T) => create('$inc', value ?? 1);

/**
 * Updates the value of the field to a specified value if the specified value is **greater than**
 * the current value of the field.
 * @param value max value
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/max/
 */
export const $max = <T>(value: T) => create('$max', value);

/**
 * Updates the value of the field to a specified value if the specified value is **less than**
 * the current value of the field.
 * @param value min value
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/min/
 */
export const $min = <T>(value: T) => create('$min', value);

/**
 * Multiplies the value of a field by a number.
 * @param value multiply factor (default `1`)
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/mul/
 */
export const $mul = <T>(value?: T) => create('$mul', value ?? 1);

/**
 * Updates the name of a field.
 * @param field new field name
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/rename/
 */
export const $rename = (field: string) => create('$rename', field);

/**
 * Assigns the specified value to the field when `{ upsert: true }` operation is used and
 * results in a new document being created. If the update operation does not result in an insert,
 * does nothing.
 * @param value the value to set on document creation
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/setOnInsert/
 */
export const $setOnInsert = <T>(value: T) => create('$setOnInsert', value);

/**
 * Deletes the specified field from a document.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/unset/
 */
export const $unset = () => create('$unset', '');

/**
 * Sets the value of a field to the current date.
 * @param type (default `date`) when `date` is used sets to MongoDB's [Date](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-date) type, for `timestamp` sets to [Timestamp](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-timestamp).
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/currentDate/
 */
export const $currentDate = (type: 'date' | 'timestamp' = 'date') =>
  create('$currentDate', { $type: type });

/**
 * Sets the value of a field to the current date as a MondoDB's [Timestamp](https://www.mongodb.com/docs/manual/reference/bson-types/#std-label-document-bson-type-timestamp) type.
 * This is an alias for `$currentDate('timestamp')`.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/currentDate/
 */
export const $timestamp = () => $currentDate('timestamp');
