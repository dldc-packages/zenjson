import { expect, test } from "vite-plus/test";
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
  // Generate the label from whatever value; `{}` / `[]` stringify to
  // "[object Object]" / "" which is what we want here.
  // oxlint-disable-next-line no-base-to-string
  test(`Identity ${value?.toString()}`, () => {
    expect(restore(JSON.parse(JSON.stringify(sanitize(value))))).toEqual(value);
  });
}
