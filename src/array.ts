import { $currentDate, $inc, $max, $min, $mul, $rename, $set, $timestamp, $unset } from './field';
import { create } from './operator';

const positional = (field?: number | string) => {
  if (typeof field === 'undefined') {
    return '$';
  }

  const isIndex = typeof field === 'number' || /^\d+/.test(field);
  if (isIndex) {
    return field.toString();
  }

  const isAll = field.startsWith('[');
  if (isAll) {
    return `$${field}`;
  }

  if (field === '') {
    return '$';
  }

  return `$.${field}`;
};

type Union<A, B> = {
  [k in keyof A | keyof B]: k extends keyof A ? A[k] : k extends keyof B ? B[k] : never;
};

const combine = <T, U, V>(value: T, chain1?: (v: T) => U, chain2?: (v: T) => V) =>
  create('$push', value, {
    ...chain1?.(value),
    ...chain2?.(value),
  } as Union<U, V>);

const position =
  <T, U, V>(chain1?: (v: T) => U, chain2?: (v: T) => V) =>
  (value: T) =>
    create('$push', value, {
      /**
       * Specifies the location in the array at which the `$push` operator inserts elements.
       * @see https://www.mongodb.com/docs/manual/reference/operator/update/position/
       * @param index zero-based index
       *
       * @example
       * ```ts
       * // insert element `10` at position 1 in the array
       * flatten({ scores: $push(10).$each().$position(1) });
       * ```
       */
      $position: (index: number) => combine({ ...value, $position: index }, chain1, chain2),
    });

const slice =
  <T, U, V>(chain1?: (v: T) => U, chain2?: (v: T) => V) =>
  (value: T) =>
    create('$push', value, {
      /**
       * Limits the number of array elements.
       * @see https://www.mongodb.com/docs/manual/reference/operator/update/slice/
       *
       * @example
       * ```ts
       * // leave only the first 3 elements
       * flatten({ grades: $push().$each().$slice(3) });
       *
       * // leave only the last element
       * flatten({ grades: $push().$each().$slice(-1) });
       *
       * // empty the array
       * flatten({ grades: $push().$each().$slice(0) });
       * ```
       */
      $slice: (count: number) => combine({ ...value, $slice: count }, chain1, chain2),
    });

const sort =
  <T, U, V>(chain1?: (v: T) => U, chain2?: (v: T) => V) =>
  (value: T) =>
    create('$push', value, {
      /**
       * Orders the elements of an array.
       * @param value sort specification (default `1`)
       * @see https://www.mongodb.com/docs/manual/reference/operator/update/sort/
       *
       * @example
       * ```ts
       * // sort ascending an array of numbers
       * flatten({ scores: $push().$each().$sort(1) });
       *
       * // sort descending an array of numbers
       * flatten({ scores: $push().$each().$sort(-1) });
       *
       * // sort ascending an array of documents with `name` field
       * flatten({ users: $push().$each().$sort({ name: 1 }) });
       * ```
       */
      $sort: <S>(specification?: S) =>
        combine({ ...value, $sort: specification ?? 1 }, chain1, chain2),
    });

/**
 * The positional operator identifies **an element** or **multiple elements** matching a
 * given query condition to be updated in an array.
 * @param field _(optional)_ field of the array document to update.
 *
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/positional/
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/positional-all/
 *
 * @example
 * ```ts
 * // Increment by one the first element that matches the update query
 * $().$inc(1);
 *
 * // Increment by one the first element's `score` field that matches the update query
 * $('score').$inc(1);
 *
 * // Increment all elements by one
 * $('[]').$inc(1);
 *
 * // Increment all elements' `score` field by one
 * $('[].score').$inc(1);
 *
 * // Find all `grades` documents that have the `std` lower than seven
 * // and increment their `grade` by ten.
 * collection.updateOne(
 *   criteria,
 *   flatten({ grades: $('[element].grade').$inc(10) }),
 *   { arrayFilters: [{ 'element.std': { $lt: 7 } }] }
 * );
 * ```
 */
export const $ = (field?: number | string) => {
  const key = positional(field);
  return create(key, undefined, {
    /**
     * Merges the array element(s) identified by the current positional operator
     * with the given object.
     * @see https://www.mongodb.com/docs/manual/reference/operator/update/positional-all/#nested-arrays
     * @param value object to merge
     *
     * @example
     * ```ts
     * flatten({ points: $('[]').merge({ x: 0, y: 1 }) });
     *
     * // {
     * //   $set: {
     * //     'points.$[].x': 1,
     * //     'points.$[].y': 2,
     * //   }
     * // }
     * ```
     */
    merge: <T extends Record<string, any>>(value: T) => create(key, create('merge', value)),

    /**
     * @see {@link $inc}
     */
    $inc: <T>(value?: T) => create(key, $inc(value)),

    /**
     * @see {@link $mul}
     */
    $mul: <T>(value?: T) => create(key, $mul(value)),

    /**
     * @see {@link $set}
     */
    $set: <T>(value: T) => create(key, $set(value)),

    /**
     * @see {@link $unset}
     */
    $unset: () => create(key, $unset()),

    /**
     * @see {@link $rename}
     */
    $rename: (field: string) => create(key, $rename(field)),

    /**
     * @see {@link $min}
     */
    $min: <T>(value: T) => create(key, $min(value)),

    /**
     * @see {@link $max}
     */
    $max: <T>(value: T) => create(key, $max(value)),

    /**
     * @see {@link $currentDate}
     */
    $currentDate: (type?: Parameters<typeof $currentDate>[0]) => create(key, $currentDate(type)),

    /**
     * @see {@link $timestamp}
     */
    $timestamp: () => create(key, $timestamp()),
  });
};

/**
 * Adds a value to an array unless the value is already present.
 * To add multiple values, chain with `$each` operator.
 * @param value the value to add
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/addToSet/
 *
 * @example
 * ```ts
 * // add just one element
 * flatten({ permissions: $addToSet('admin') });
 *
 * // add multiple elements
 * flatten({ permissions: $addToSet(['read', 'write']).$each() });
 * ```
 */
export const $addToSet = <T>(value: T) =>
  create('$addToSet', value, {
    /**
     * Specifies that value to add is an array and that each element should be added.
     * @see https://www.mongodb.com/docs/manual/reference/operator/update/each/
     */
    $each: () => create('$addToSet', { $each: Array.isArray(value) ? value : [value] }),
  });

/**
 * Removes the first or last element of an array.
 * @param value specify `-1` to remove the first element, `1` to remove the last element
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/pop/
 *
 * @example
 * ```ts
 * // remove the first element from the array
 * flatten({ grades: $pop(-1) });
 * // same as:
 * flatten({ grades: $pop().first() });
 * ```
 */
export const $pop = (value: 1 | -1 = 1) =>
  create('$pop', value, {
    /**
     * Removes the first element from the array.
     */
    first: () => create('$pop', -1),

    /**
     * Removes the last element from the array.
     */
    last: () => create('$pop', 1),
  });

/**
 * Removes all instances of the specified values from an existing array.
 * @param value the value(s) to remove from the array
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/pullAll/
 *
 * @example
 * ```ts
 * // remove all instances of the value `1` and `2` from the array
 * flatten({ score: $pullAll([1, 2]) });
 * ```
 */
export const $pullAll = <T>(value: T | T[]) =>
  create('$pullAll', Array.isArray(value) ? value : [value]);

/**
 * Removes from an existing array all instances of a value or values that match a specified condition.
 * Unlike the {@link $pullAll} operator, this operator can be used to remove all instances that match a query.
 * @param value the value(s) or condition to match to remove from the array
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/pull/
 *
 * @example
 * ```ts
 * // remove all instances of the value `0` and `1` from the array;
 * // same as using $pullAll
 * flatten({ scores: $pull([0, 1]) });
 *
 * // remove all instances lower than or equal to `3`
 * flatten({ scores: $pull({ $lte: 3 }) })
 *
 * // remove all documents with the field `name` equal to `Test`
 * flatten({ users: $pull({ name: { $eq: 'Test' } }) })
 * ```
 */
export const $pull = <T>(value: T | T[]) =>
  create('$pull', Array.isArray(value) ? { $in: value } : value);

/**
 * Appends a specified value to an array.
 * @param value the value(s) to append to the array
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/push/
 *
 * @example
 * ```ts
 * // append one element
 * flatten({ scores: $push(1) });
 *
 * // append multiple elements
 * flatten({ scores: $push([1, 2, 3]).$each() });
 *
 * // append an element and update to leave only the last ten
 * flatten({ scores: $push(7).$each().$slice(-10) });
 *
 * // append an element and update to leave only the last ten sorted by value
 * flatten({ scores: $push(7).$each().$sort(1).$slice(-10) });
 *
 * // append an element at position three in the array
 * flatten({ scores: $push(7).$each().$position(2) });
 * ```
 */
export const $push = <T>(value?: T | T[]) =>
  create('$push', value, {
    /**
     * Specifies that value to add is an array and that each element should be added.
     * @see https://www.mongodb.com/docs/manual/reference/operator/update/each/
     */
    $each: () => {
      const arr = typeof value === 'undefined' ? [] : Array.isArray(value) ? value : [value];
      const eachValue = { $each: arr };

      return create('$push', eachValue, {
        ...position(sort(slice()), slice(sort()))(eachValue),
        ...slice(position(sort()), sort(position()))(eachValue),
        ...sort(slice(position()), position(slice()))(eachValue),
      });
    },
  });

/**
 * Limits the number of array elements.
 * Alias for `$push().$each().$slice()`.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/slice/
 *
 * @example
 * ```ts
 * // leave only the first 3 elements
 * flatten({ grades: $slice(3) });
 *
 * // leave only the last element
 * flatten({ grades: $slice(-1) });
 *
 * // empty the array
 * flatten({ grades: $slice(0) });
 * ```
 */
export const $slice = (count: number) => $push().$each().$slice(count);

/**
 * Orders the elements of an array.
 * Alias for `$push().$each().$sort()`.
 * @param value sort specification (default `1`)
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/sort/
 *
 * @example
 * ```ts
 * // sort ascending an array of numbers
 * flatten({ scores: $sort(1) });
 *
 * // sort descending an array of numbers
 * flatten({ scores: $sort(-1) });
 *
 * // sort ascending an array of documents with `name` field
 * flatten({ users: $sort({ name: 1 }) });
 * ```
 */
export const $sort = <S>(specification?: S) => $push().$each().$sort(specification);
