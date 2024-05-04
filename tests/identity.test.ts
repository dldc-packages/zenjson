import { expect } from "$std/expect/mod.ts";
import { restore, sanitize } from "../mod.ts";

const VALUES = [
  "",
  "foo",
  " ",
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
  Deno.test(`Identity ${value?.toString()}`, () => {
    expect(restore(JSON.parse(JSON.stringify(sanitize(value))))).toEqual(value);
  });
}
