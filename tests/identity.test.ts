import { expect, test } from 'vitest';
import { restore, sanitize } from '../src/mod';

const VALUES = [
  '',
  'foo',
  ' ',
  0,
  -1,
  Infinity,
  NaN,
  -Infinity,
  {},
  [],
  undefined,
  null,
  [1, 2, 3],
  { a: { b: { c: { d: undefined } } } },
];

for (const value of VALUES) {
  test(`Identity ${value}`, () => {
    expect(restore(JSON.parse(JSON.stringify(sanitize(value))))).toEqual(value);
  });
}
