import { $, $addToSet, $pop, $pull, $pullAll, $push, $slice, $sort } from '../src/array';
import { isOperator, getValue, getType } from '../src/operator';

describe('Array update operators', () => {
  describe('$()', () => {
    it('Should be operator', () => {
      expect(isOperator($())).toStrictEqual(true);
    });

    it('Should have no value', () => {
      expect(getValue($())).toBeUndefined();
    });

    it.each([
      ['$', $()],
      ['$.name', $('name')],
      ['$.name.first', $('name.first')],
      ['0', $(0)],
      ['0', $('0')],
      ['42', $(42)],
      ['42', $('42')],
      ['2.name', $('2.name')],
      ['$[]', $('[]')],
      ['$[].name', $('[].name')],
      ['$[condition]', $('[condition]')],
      ['$[condition].name', $('[condition].name')],
    ])('Should verify type "%s"', (type, operator) => {
      expect(getType(operator)).toStrictEqual(type);
    });

    describe.each([
      ['$inc', $().$inc(), 1],
      ['$inc', $().$inc(1), 1],
      ['$mul', $().$mul(), 1],
      ['$mul', $().$mul(2), 2],
      ['$set', $().$set('test'), 'test'],
      ['$unset', $().$unset(), ''],
      ['$min', $().$min(10), 10],
      ['$max', $().$max(100), 100],
      ['$rename', $().$rename('x'), 'x'],
      ['$currentDate', $().$currentDate(), { $type: 'date' }],
      ['$currentDate', $().$currentDate('date'), { $type: 'date' }],
      ['$currentDate', $().$currentDate('timestamp'), { $type: 'timestamp' }],
      ['$currentDate', $().$timestamp(), { $type: 'timestamp' }],
    ])('.%s()', (type, operator, value) => {
      it('Should be operator', () => {
        expect(isOperator(operator)).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType(operator)).toStrictEqual('$');
      });

      it('Should chain operator', () => {
        expect(isOperator(getValue(operator))).toStrictEqual(true);
      });

      it('Should verify chained operator type', () => {
        expect(getType(getValue(operator))).toStrictEqual(type);
      });

      it('Should verify chained operator value', () => {
        expect(getValue(getValue(operator))).toStrictEqual(value);
      });
    });
  });

  describe('$addToSet()', () => {
    it('Should be operator', () => {
      expect(isOperator($addToSet(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($addToSet(1))).toStrictEqual('$addToSet');
    });

    it.each([null, 10, 'test', true, [1, 2, 3], new Date()])('Should verify value', (value) => {
      expect(getValue($addToSet(value))).toStrictEqual(value);
    });

    describe('.$each())', () => {
      it('Should be operator', () => {
        expect(isOperator($addToSet(1).$each())).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType($addToSet(1).$each())).toStrictEqual('$addToSet');
      });

      it.each([null, 10, 'test', true, new Date()])('Should verify value', (value) => {
        expect(getValue($addToSet(value).$each())).toStrictEqual({ $each: [value] });
      });

      it('Should verify array value', () => {
        const value = [1, 2, 3];
        expect(getValue($addToSet(value).$each())).toStrictEqual({ $each: value });
      });
    });
  });

  describe('$pop()', () => {
    it('Should be operator', () => {
      expect(isOperator($pop())).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($pop())).toStrictEqual('$pop');
    });

    it('Should verify the default value', () => {
      expect(getValue($pop())).toStrictEqual(1);
    });

    it.each([-1, 1])('Should verify value', (value: any) => {
      expect(getValue($pop(value))).toStrictEqual(value);
    });

    describe('.first()', () => {
      it('Should be operator', () => {
        expect(isOperator($pop().first())).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType($pop().first())).toStrictEqual('$pop');
      });

      it('Should verify value', () => {
        expect(getValue($pop().first())).toStrictEqual(-1);
      });
    });

    describe('.last()', () => {
      it('Should be operator', () => {
        expect(isOperator($pop().last())).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType($pop().last())).toStrictEqual('$pop');
      });

      it('Should verify value', () => {
        expect(getValue($pop().last())).toStrictEqual(1);
      });
    });
  });

  describe('$pullAll()', () => {
    it('Should be operator', () => {
      expect(isOperator($pullAll(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($pullAll(1))).toStrictEqual('$pullAll');
    });

    it.each([null, 0, 42, 'test', { x: 1 }, new Date()])('Should verify value', (value) => {
      expect(getValue($pullAll(value))).toStrictEqual([value]);
    });

    it.each([[], [1, 2, 3], ['test']])('Should verify array value', (...value: any[]) => {
      expect(getValue($pullAll(value))).toStrictEqual(value);
    });
  });

  describe('$pull()', () => {
    it('Should be operator', () => {
      expect(isOperator($pull(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($pull(1))).toStrictEqual('$pull');
    });

    it.each([null, 'test', { score: 8, item: 'B' }])('Should verify value', (value) => {
      expect(getValue($pull(value))).toStrictEqual(value);
    });

    it('Should verify array value', () => {
      const value = ['A', 'B', 'C'];
      expect(getValue($pull(value))).toStrictEqual({ $in: value });
    });
  });

  describe('$push()', () => {
    it('Should be operator', () => {
      expect(isOperator($push(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($push(1))).toStrictEqual('$push');
    });

    it('Should verify default value', () => {
      expect(getValue($push())).toBeUndefined();
    });

    it.each([null, 0, 9, 'test', { x: 1 }, [1, 2, 3], new Date()])(
      'Should verify value',
      (value) => {
        expect(getValue($push(value))).toStrictEqual(value);
      }
    );

    describe('.$each()', () => {
      it('Should be operator', () => {
        expect(isOperator($push(1).$each())).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType($push(1).$each())).toStrictEqual('$push');
      });

      it('Should verify default value', () => {
        expect(getValue($push().$each())).toStrictEqual({ $each: [] });
      });

      it.each([null, 0, 9, 'test', { x: 1 }, new Date()])('Should verify value', (value) => {
        expect(getValue($push(value).$each())).toStrictEqual({ $each: [value] });
      });

      it('Should verify array value', () => {
        const value = [1, 2, 3];
        expect(getValue($push(value).$each())).toStrictEqual({ $each: value });
      });

      describe.each([
        ['<empty>', $push().$each(), { $each: [] }],
        ['<values>', $push([1, 2, 3]).$each(), { $each: [1, 2, 3] }],
      ])('%s', (_, op, arr) => {
        describe.each([
          ['.$slice()', op.$slice(1), { $slice: 1 }],
          ['.$slice().$sort()', op.$slice(1).$sort(-1), { $slice: 1, $sort: -1 }],
          [
            '.$slice().$sort().$position()',
            op.$slice(1).$sort(-1).$position(2),
            { $slice: 1, $sort: -1, $position: 2 },
          ],
          ['.$slice().$position()', op.$slice(1).$position(-1), { $slice: 1, $position: -1 }],
          [
            '.$slice().$position().$sort()',
            op.$slice(2).$position(-1).$sort(1),
            { $slice: 2, $position: -1, $sort: 1 },
          ],

          ['.$sort()', op.$sort(1), { $sort: 1 }],
          ['.$sort().$slice()', op.$sort(1).$slice(2), { $sort: 1, $slice: 2 }],
          [
            '.$sort().$slice().$position()',
            op.$sort(1).$slice(2).$position(3),
            { $sort: 1, $slice: 2, $position: 3 },
          ],
          ['.$sort().$position()', op.$sort(1).$position(2), { $sort: 1, $position: 2 }],
          [
            '.$sort().$position().$slice()',
            op.$sort(1).$position(2).$slice(3),
            { $sort: 1, $position: 2, $slice: 3 },
          ],

          ['.$position()', op.$position(1), { $position: 1 }],
          ['.$position().$slice()', op.$position(1).$slice(2), { $position: 1, $slice: 2 }],
          [
            '.$position().$slice().$sort()',
            op.$position(1).$slice(2).$sort(-1),
            { $position: 1, $slice: 2, $sort: -1 },
          ],
          ['.$position().$sort()', op.$position(1).$sort(-1), { $position: 1, $sort: -1 }],
          [
            '.$position().$sort().$slice()',
            op.$position(1).$sort(-1).$slice(2),
            { $position: 1, $sort: -1, $slice: 2 },
          ],
        ])('%s', (_, operator, value) => {
          it('Should be operator', () => {
            expect(isOperator(operator)).toStrictEqual(true);
          });

          it('Should verify type', () => {
            expect(getType(operator)).toStrictEqual('$push');
          });

          it('Should verify value', () => {
            expect(getValue(operator)).toStrictEqual({ ...arr, ...value });
          });
        });
      });
    });
  });

  describe('$slice()', () => {
    it('Should be operator', () => {
      expect(isOperator($slice(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($slice(1))).toStrictEqual('$push');
    });

    it('Should verify value', () => {
      expect(getValue($slice(5))).toStrictEqual({ $each: [], $slice: 5 });
    });

    describe.each([
      ['.$sort()', $slice(1).$sort('a'), { $each: [], $slice: 1, $sort: 'a' }],
      [
        '.$sort().$position()',
        $slice(1).$sort('a').$position(5),
        { $each: [], $slice: 1, $sort: 'a', $position: 5 },
      ],
      ['.$position()', $slice(1).$position(5), { $each: [], $slice: 1, $position: 5 }],
      [
        '.$position().$sort()',
        $slice(1).$position(5).$sort('a'),
        { $each: [], $slice: 1, $sort: 'a', $position: 5 },
      ],
    ])('%s', (_, operator, value) => {
      it('Should be operator', () => {
        expect(isOperator(operator)).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType(operator)).toStrictEqual('$push');
      });

      it('Should verify value', () => {
        expect(getValue(operator)).toStrictEqual(value);
      });
    });
  });

  describe('$sort()', () => {
    it('Should be operator', () => {
      expect(isOperator($sort(1))).toStrictEqual(true);
    });

    it('Should verify type', () => {
      expect(getType($sort(1))).toStrictEqual('$push');
    });

    it('Should verify value', () => {
      expect(getValue($sort(-1))).toStrictEqual({ $each: [], $sort: -1 });
    });

    it('Should verify default value', () => {
      expect(getValue($sort())).toStrictEqual({ $each: [], $sort: 1 });
    });

    describe.each([
      ['.$slice()', $sort(1).$slice(3), { $each: [], $slice: 3, $sort: 1 }],
      [
        '.$slice().$position()',
        $sort(1).$slice(3).$position(5),
        { $each: [], $slice: 3, $sort: 1, $position: 5 },
      ],
      ['.$position()', $sort(1).$position(5), { $each: [], $sort: 1, $position: 5 }],
      [
        '.$position().$slice()',
        $sort(1).$position(5).$slice(3),
        { $each: [], $slice: 3, $sort: 1, $position: 5 },
      ],
    ])('%s', (_, operator, value) => {
      it('Should be operator', () => {
        expect(isOperator(operator)).toStrictEqual(true);
      });

      it('Should verify type', () => {
        expect(getType(operator)).toStrictEqual('$push');
      });

      it('Should verify value', () => {
        expect(getValue(operator)).toStrictEqual(value);
      });
    });
  });
});
