import {
  throwDuplicatedCustomTypeName,
  throwInvalidSerializedSpecialValue,
  throwUnexpectedSpecialValue,
} from './erreur';
import type { ITypedMap } from './typedMap';

export interface ICheckContext {
  readonly validTypes: readonly string[];
  readonly state: ITypedMap;
}

export interface ISanitizeContext {
  readonly validTypes: readonly string[];
  readonly sanitize: (val: unknown) => unknown;
  readonly state: ITypedMap;
}

export interface IRestoreContext {
  readonly validTypes: readonly string[];
  readonly restore: (val: unknown) => unknown;
  readonly state: ITypedMap;
}

export interface ICustomType<T, Sanitized = unknown> {
  readonly name: string;
  readonly check: (val: unknown, ctx: ICheckContext) => boolean;
  readonly sanitize: (val: T, ctx: ISanitizeContext) => unknown;
  readonly restore: (sanitized: Sanitized, ctx: IRestoreContext) => T;
}

export type TCustomTypes = readonly ICustomType<any, any>[];

export function isSanitizedTuple(item: unknown, validTypes: readonly string[]): item is [string, unknown] {
  return Boolean(
    item && Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && validTypes.includes(item[0]),
  );
}

export const dateType: ICustomType<Date, string> = {
  name: 'date',
  check: (val) => val instanceof Date,
  sanitize: (val) => val.toISOString(),
  restore: (str) => {
    const b = str.split(/\D+/).map((v) => parseInt(v, 10));
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  },
};

export const undefinedType: ICustomType<undefined, null> = {
  name: 'undefined',
  check: (val) => val === undefined,
  sanitize: () => null,
  restore: () => undefined,
};

export const specialNumberType: ICustomType<number, 'Infinity' | '-Infinity' | 'NaN'> = {
  name: 'number',
  check: (val) => typeof val === 'number' && (val === Infinity || val === -Infinity || isNaN(val)),
  sanitize: (val) => {
    if (isNaN(val)) {
      return 'NaN';
    }
    if (val === Infinity) {
      return 'Infinity';
    }
    if (val === -Infinity) {
      return '-Infinity';
    }
    return throwUnexpectedSpecialValue(val);
  },
  restore: (str) => {
    if (str === 'NaN') {
      return NaN;
    }
    if (str === '-Infinity') {
      return -Infinity;
    }
    if (str === 'Infinity') {
      return Infinity;
    }
    return throwInvalidSerializedSpecialValue(str);
  },
};

// detect array that would be restored as custom type and convert them into a custom type
export const arrayType: ICustomType<Array<any>, Array<any>> = {
  name: 'array',
  check: (val, ctx) => isSanitizedTuple(val, ctx.validTypes),
  sanitize: (val, ctx) => val.map((v) => ctx.sanitize(v)),
  restore: (val, ctx) => val.map((v) => ctx.restore(v)),
};

export const defaultTypes: TCustomTypes = [dateType, undefinedType, specialNumberType, arrayType];

export function validateTypes(types: TCustomTypes): void {
  const names = new Set();
  types.forEach((type) => {
    if (names.has(type.name)) {
      return throwDuplicatedCustomTypeName(type.name);
    }
    names.add(type.name);
  });
}
