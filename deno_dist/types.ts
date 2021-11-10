export type CheckContext = {
  validTypes: ReadonlyArray<string>;
};

export type SanitizeContext = {
  validTypes: ReadonlyArray<string>;
  sanitize: (val: unknown) => unknown;
};

export type RestoreContext = {
  validTypes: ReadonlyArray<string>;
  restore: (val: unknown) => unknown;
};

export type CustomType<T, Sanitized = unknown> = {
  name: string;
  check: (val: unknown, ctx: CheckContext) => boolean;
  sanitize: (val: T, ctx: SanitizeContext) => unknown;
  restore: (sanitized: Sanitized, ctx: RestoreContext) => T;
};

export type CustomTypes = Array<CustomType<any, any>>;

export function isSanitizedTuple(
  item: unknown,
  validTypes: ReadonlyArray<string>
): item is [string, unknown] {
  return Boolean(
    item &&
      Array.isArray(item) &&
      item.length === 2 &&
      typeof item[0] === 'string' &&
      validTypes.includes(item[0])
  );
}

export const dateType: CustomType<Date, string> = {
  name: 'date',
  check: (val) => val instanceof Date,
  sanitize: (val) => val.toISOString(),
  restore: (str) => {
    const b = str.split(/\D+/).map((v) => parseInt(v, 10));
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  },
};

export const undefinedType: CustomType<undefined, null> = {
  name: 'undefined',
  check: (val) => val === undefined,
  sanitize: () => null,
  restore: () => undefined,
};

export const specialNumberType: CustomType<number, 'Infinity' | '-Infinity' | 'NaN'> = {
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
    throw new Error(`Unexpected special number value ${val}`);
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
    throw new Error(`Invalid serialized special number: ${str}`);
  },
};

// detect array that would be restored as custom type and convert them into a custom type
export const arrayType: CustomType<Array<any>, Array<any>> = {
  name: 'array',
  check: (val, ctx) => isSanitizedTuple(val, ctx.validTypes),
  sanitize: (val, ctx) => val.map((v) => ctx.sanitize(v)),
  restore: (val, ctx) => val.map((v) => ctx.restore(v)),
};

export const defaultTypes = [dateType, undefinedType, specialNumberType, arrayType];

export function validateTypes(types: CustomTypes): void {
  const names = new Set();
  types.forEach((type) => {
    if (names.has(type.name)) {
      throw new Error(`Invalid custom type list: duplicate type name: "${type.name}"`);
    }
    names.add(type.name);
  });
}
