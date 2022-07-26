const OPERATOR_TYPE = Symbol('type');
const OPERATOR_VALUE = Symbol('value');

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Operator {}

/**
 * Checks if a given object is an operator.
 * @example
 * ```ts
 * isOperator($set(1)); // true
 * isOperator({}); // false
 * ```
 * @param obj the object to check
 * @returns `true` if the objects is an operator
 */
export const isOperator = <T>(obj: T): boolean =>
  typeof obj === 'object' && !!obj && OPERATOR_TYPE in obj;

export const getType = (operator: any) => operator[OPERATOR_TYPE];

export const getValue = (operator: any) => operator[OPERATOR_VALUE];

export const create = <T, U = Operator>(type: string, value: T, obj?: U) =>
  Object.defineProperties(obj ?? {}, {
    [OPERATOR_TYPE]: {
      configurable: false,
      enumerable: false,
      writable: false,
      value: type,
    },
    [OPERATOR_VALUE]: {
      configurable: false,
      enumerable: false,
      writable: false,
      value,
    },
  }) as U;
