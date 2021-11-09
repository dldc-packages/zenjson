import { createRestore, CustomType, defaultTypes, restore } from '../src/mod';

test('restore primitive', () => {
  expect(restore('foo')).toBe('foo');
  expect(restore(42)).toBe(42);
  expect(restore(null)).toBe(null);
});

test('restore object and array', () => {
  expect(restore([1, 2, 3])).toEqual([1, 2, 3]);
  expect(restore({ a: true, b: false })).toEqual({ a: true, b: false });
});

test('restore return a new object', () => {
  const obj = { a: true, b: false };
  expect(restore(obj)).toEqual({ a: true, b: false });
  expect(restore(obj)).not.toBe(obj);
});

test('restore undefined', () => {
  expect(restore(['undefined', null])).toEqual(undefined);
});

test('restore undefined in array', () => {
  expect(restore([['undefined', null]])).toEqual([undefined]);
});

test('restore array when it look like sanitized value', () => {
  expect(restore(['array', ['undefined', null]])).toEqual(['undefined', null]);
});

test('restore special numbers', () => {
  expect(restore(['number', 'NaN'])).toEqual(NaN);
  expect(restore(['number', 'Infinity'])).toEqual(Infinity);
  expect(restore(['number', '-Infinity'])).toEqual(-Infinity);
});

test('restore Date', () => {
  expect(restore(['date', '2021-07-20T00:00:00.000Z'])).toEqual(new Date(Date.UTC(2021, 6, 20)));
});

test('restore array that look like serialized', () => {
  expect(restore(['foo', 42])).toEqual(['foo', 42]);
});

describe('createRestore', () => {
  test('fail if multiple types have the same name', () => {
    expect(() => createRestore([...defaultTypes, ...defaultTypes])).toThrow();
  });

  const mapType: CustomType<Map<any, any>, Array<[any, any]>> = {
    name: 'map',
    check: (val) => val instanceof Map,
    sanitize: (val) => Array.from(val.entries()),
    restore: (entries) => new Map(entries),
  };

  const restore = createRestore([...defaultTypes, mapType]);

  test('custom type is used', () => {
    expect(restore(['map', []])).toEqual(new Map());
    expect(restore(['map', [['foo', 42]]])).toEqual(new Map([['foo', 42]]));
  });
});
