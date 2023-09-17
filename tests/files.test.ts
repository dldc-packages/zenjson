import { expect, test } from 'vitest';
import type { ICustomType } from '../src/mod';
import { createRestore, createSanitize, createTypedKey, createTypedMap, defaultTypes } from '../src/mod';

const filesKey = createTypedKey<Map<string, ArrayBuffer>>('files');

/**
 * This custom type replace files by a random name and store each files in the state so we can send them later
 */
const fileType: ICustomType<ArrayBuffer, string> = {
  name: 'file',
  check: (val) => val instanceof ArrayBuffer,
  sanitize: (val, ctx) => {
    const name = Math.random().toString(36).substring(2);
    ctx.state.updateOrDefault(filesKey, new Map<string, ArrayBuffer>(), (files) => {
      files.set(name, val);
      return files;
    });
    return name;
  },
  restore: (name, ctx) => {
    const files = ctx.state.getOrFail(filesKey);
    const file = files.get(name);
    if (!file) {
      throw new Error(`File ${name} not found`);
    }
    return file;
  },
};

test('Sanitize files using ctx.state', () => {
  const data: unknown = {
    arr: [
      {
        file1: new ArrayBuffer(1),
        file2: new ArrayBuffer(1),
      },
    ],
    file3: new ArrayBuffer(1),
  };

  const sanitize = createSanitize([...defaultTypes, fileType]);
  const state = createTypedMap();
  const sanitized = sanitize(data, state);

  expect(sanitized).toEqual({
    arr: [
      {
        file1: ['file', expect.any(String)],
        file2: ['file', expect.any(String)],
      },
    ],
    file3: ['file', expect.any(String)],
  });
  expect(Array.from(state.getOrFail(filesKey).keys())).toEqual([
    expect.any(String),
    expect.any(String),
    expect.any(String),
  ]);
});

test('Sanitize then restore files', () => {
  const data = {
    arr: [
      {
        file1: new ArrayBuffer(1),
        file2: new ArrayBuffer(1),
      },
    ],
    file3: new ArrayBuffer(1),
  };

  const sanitize = createSanitize([...defaultTypes, fileType]);
  const restore = createRestore([...defaultTypes, fileType]);

  const state = createTypedMap();
  const sanitized = sanitize(data, state);
  const restored = restore(sanitized, state) as any;
  expect(restored).toEqual(data);
  expect(restored.file3).toBeInstanceOf(ArrayBuffer);
  expect(restored.file3).toBe(data.file3);
});
