// deno-lint-ignore-file no-explicit-any

import { expect } from "$std/expect/mod.ts";
import {
  createSanitize,
  defaultTypes,
  type ICustomType,
  sanitize,
} from "../mod.ts";

Deno.test("sanitize primitive", () => {
  expect(sanitize("foo")).toBe("foo");
  expect(sanitize(42)).toBe(42);
  expect(sanitize(null)).toBe(null);
});

Deno.test("sanitize object and array", () => {
  expect(sanitize([1, 2, 3])).toEqual([1, 2, 3]);
  expect(sanitize({ a: true, b: false })).toEqual({ a: true, b: false });
});

Deno.test("sanitize return a new object", () => {
  const obj = { a: true, b: false };
  expect(sanitize(obj)).toEqual({ a: true, b: false });
  expect(sanitize(obj)).not.toBe(obj);
});

Deno.test("sanitize undefined", () => {
  expect(sanitize(undefined)).toEqual(["undefined", null]);
});

Deno.test("sanitize undefined in array", () => {
  expect(sanitize([undefined])).toEqual([["undefined", null]]);
});

Deno.test("sanitize array when it look like sanitized value", () => {
  expect(sanitize(["undefined", null])).toEqual(["array", ["undefined", null]]);
});

Deno.test("sanitize special numbers", () => {
  expect(sanitize(NaN)).toEqual(["number", "NaN"]);
  expect(sanitize(Infinity)).toEqual(["number", "Infinity"]);
  expect(sanitize(-Infinity)).toEqual(["number", "-Infinity"]);
});

Deno.test("sanitize Date", () => {
  expect(sanitize(new Date(Date.UTC(2021, 6, 20)))).toEqual([
    "date",
    "2021-07-20T00:00:00.000Z",
  ]);
});

Deno.test("fail if multiple types have the same name", () => {
  expect(() => createSanitize([...defaultTypes, ...defaultTypes])).toThrow();
});

const mapType: ICustomType<Map<any, any>, Array<[any, any]>> = {
  name: "map",
  check: (val) => val instanceof Map,
  sanitize: (val) => Array.from(val.entries()),
  restore: (entries) => new Map(entries),
};

const sanitizeCustom = createSanitize([...defaultTypes, mapType]);

Deno.test("custom type is used", () => {
  expect(sanitizeCustom(new Map())).toEqual(["map", []]);
  expect(sanitizeCustom(new Map([["foo", 42]]))).toEqual(["map", [[
    "foo",
    42,
  ]]]);
});
