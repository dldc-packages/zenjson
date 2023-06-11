import { describe, expect, test } from 'vitest';
import { CustomType, createSanitize, defaultTypes, sanitize } from '../src/mod';

test('sanitize primitive', () => {
  expect(sanitize('foo')).toBe('foo');
  expect(sanitize(42)).toBe(42);
  expect(sanitize(null)).toBe(null);
});

test('sanitize object and array', () => {
  expect(sanitize([1, 2, 3])).toEqual([1, 2, 3]);
  expect(sanitize({ a: true, b: false })).toEqual({ a: true, b: false });
});

test('sanitize return a new object', () => {
  const obj = { a: true, b: false };
  expect(sanitize(obj)).toEqual({ a: true, b: false });
  expect(sanitize(obj)).not.toBe(obj);
});

test('sanitize undefined', () => {
  expect(sanitize(undefined)).toEqual(['undefined', null]);
});

test('sanitize undefined in array', () => {
  expect(sanitize([undefined])).toEqual([['undefined', null]]);
});

test('sanitize array when it look like sanitized value', () => {
  expect(sanitize(['undefined', null])).toEqual(['array', ['undefined', null]]);
});

test('sanitize special numbers', () => {
  expect(sanitize(NaN)).toEqual(['number', 'NaN']);
  expect(sanitize(Infinity)).toEqual(['number', 'Infinity']);
  expect(sanitize(-Infinity)).toEqual(['number', '-Infinity']);
});

test('sanitize Date', () => {
  expect(sanitize(new Date(Date.UTC(2021, 6, 20)))).toEqual(['date', '2021-07-20T00:00:00.000Z']);
});

describe('createSanitize', () => {
  test('fail if multiple types have the same name', () => {
    expect(() => createSanitize([...defaultTypes, ...defaultTypes])).toThrow();
  });

  const mapType: CustomType<Map<any, any>, Array<[any, any]>> = {
    name: 'map',
    check: (val) => val instanceof Map,
    sanitize: (val) => Array.from(val.entries()),
    restore: (entries) => new Map(entries),
  };

  const sanitize = createSanitize([...defaultTypes, mapType]);

  test('custom type is used', () => {
    expect(sanitize(new Map())).toEqual(['map', []]);
    expect(sanitize(new Map([['foo', 42]]))).toEqual(['map', [['foo', 42]]]);
  });
});
