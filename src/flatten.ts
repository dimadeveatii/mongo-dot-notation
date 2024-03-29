import { getType, getValue, isOperator } from './operator';

const mergeOptions = (options?: Options): Required<Options> => ({
  array: false,
  skipEmptyObjects: false,
  ...options,
});

/**
 * Flatten options.
 */
export type Options = {
  /**
   * If true, arrays will be flattened and their indexes will be used as keys.
   * @default false
   * @example
   * ```ts
   * flatten({ rules: [{value: 7}] }, { array: true });
   * // { $set: { 'rules.0.value': 7 } }
   *
   * flatten({ rules: [{value: 7}] }, { array: false });
   * // { $set: { 'rules': [{value: 7}] } }
   * ```
   */
  array?: boolean;

  /**
   * If true, empty objects are ignored and removed from the flattened result.
   * @default false
   * @example
   * ```ts
   * flatten({ left: {x: 1}, right: {} }, { skipEmptyObjects: true });
   * // { $set: { 'left.x': 1 } }
   *
   * flatten({ left: {x: 1}, right: {} }, { skipEmptyObjects: false });
   * // { $set: { 'left.x': 1, 'right': {} } }
   * ```
   */
  skipEmptyObjects?: boolean;
};

/**
 * Transforms a given object into the MongoDB's update instructions.
 * @param value the input object to transform
 *
 * @example
 * ```ts
 * flatten({
 *   first_name: $rename('firstName'),
 *   lastName: 'Doe',
 *   updatedOn: $timestamp(),
 *   address: {
 *     primary: true
 *   },
 *   access: $push(new Date()),
 * });
 *
 * // equivalent to:
 * {
 *   "$rename": {
 *     "first_name": "firstName"
 *   },
 *   "$set": {
 *     "lastName": "Doe",
 *     "address.primary": true
 *   },
 *   "$currentDate": {
 *     "updatedOn": {
 *       "$type": "timestamp"
 *     }
 *   },
 *   "$push": {
 *     "access": new Date()
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // update arrays
 * flatten({ scores: [{ value: 4 }, {value: 2}] }, { array: true} );
 *
 * // equivalent to:
 * {
 *   "$set": {
 *     "scores.0.value": 4,
 *     "scores.1.value": 2,
 *   }
 * }
 * ```
 */
export const flatten = <T extends Record<string, any>>(value: T, options?: Options) => {
  if (isAtomic(value) || Array.isArray(value)) {
    return value;
  }

  const keyValues = Object.entries(value);
  if (keyValues.length === 0) {
    return value;
  }

  const d = dot(mergeOptions(options));
  return keyValues.reduce((acc, [key, value]) => d(acc, key, value), {});
};

const mergeInner = <T>(
  obj: Record<string, any>,
  field: string,
  inner: string,
  value: T
): Record<string, any> => ({
  ...obj,
  [field]: {
    ...obj[field],
    [inner]: value,
  },
});

const dot = (options: Required<Options>) => {
  const merge = <T>(
    instructions: Record<string, any>,
    operator: string,
    field: string,
    value: T
  ): Record<string, any> => {
    if (!isOperator(value)) {
      return mergeInner(instructions, operator, field, value);
    }

    if (getType(value) === 'merge') {
      const mergeValue = getValue(value);
      return isNullOrUndefined(mergeValue)
        ? instructions
        : dotMerge(instructions, `${field}.${operator}`, mergeValue);
    }

    return mergeInner(instructions, getType(value), `${field}.${operator}`, getValue(value));
  };

  const visit = <T>(
    instructions: Record<string, any>,
    field: string,
    value: T
  ): Record<string, any> => {
    const tail = isAtomic(value) || (Array.isArray(value) && !options.array);
    if (tail) {
      return merge(instructions, '$set', field, value);
    }

    if (isOperator(value)) {
      return merge(instructions, getType(value), field, getValue(value));
    }

    const keyValues = Object.entries(value as object);
    if (keyValues.length === 0) {
      const ignoreValue = (Array.isArray(value) && options.array) || options.skipEmptyObjects;
      return ignoreValue ? instructions : merge(instructions, '$set', field, value);
    }

    return keyValues.reduce(
      (acc, [key, value]) => visit(acc, `${field}.${key}`, value),
      instructions
    );
  };

  return visit;
};

const dotMerge = dot({ array: true, skipEmptyObjects: true });

const isAtomic = <T>(value: T) => isPrimitive(value) || isBsonType(value);

const TYPEOF_PRIMITIVES = ['number', 'string', 'boolean', 'symbol', 'bigint'];
/* istanbul ignore next */
const INSTANCEOF_PRIMITIVES = [Date, RegExp, typeof Buffer !== undefined ? Buffer : []]
  .flat()
  .filter(Boolean);

const isPrimitive = <T = any>(value: T) => {
  return (
    isNullOrUndefined(value) ||
    TYPEOF_PRIMITIVES.some((type) => typeof value === type) ||
    INSTANCEOF_PRIMITIVES.some((type) => value instanceof type)
  );
};

const isNullOrUndefined = <T>(value: T) => value === null || typeof value === 'undefined';

const isBsonType = (value: any) => '_bsontype' in value;
