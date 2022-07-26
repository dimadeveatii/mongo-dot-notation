import { create } from './operator';

/**
 * Uses a bitwise _and_ operation to update a field.
 * Alias for `$bit().$and()`.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-and
 */
export const $and = <T>(value: T) => create('$bit', { and: value });

/**
 * Uses a bitwise `or` operation to update a field.
 * Alias for `$bit().$or()`.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-or
 */
export const $or = <T>(value: T) => create('$bit', { or: value });

/**
 * Uses a bitwise `xor` operation to update a field.
 * Alias for `$bit().$xor()`.
 * @see https://www.mongodb.com/docs/manual/reference/operator/update/bit/#bitwise-xor
 */
export const $xor = <T>(value: T) => create('$bit', { xor: value });

/**
 * Performs a bitwise update of a field.
 * Should be chained with a logical operator.
 * @see https://docs.mongodb.com/manual/reference/operator/update/#bitwise
 *
 * @example
 * ```ts
 * flatten({ permissions: $bit().$and(4) });
 * // same as:
 * flatten({ permissions: $and(4) })
 * ```
 */
export const $bit = () =>
  create('', undefined, {
    $and,
    $or,
    $xor,
  });
