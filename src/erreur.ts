import { createErreurStore } from '@dldc/erreur';

export type TZenjsonErreurData =
  | { kind: 'CustomTypeNotFound'; typeName: string }
  | { kind: 'KeyNotFound'; keyName: string }
  | { kind: 'UnexpectedSpecialValue'; value: unknown }
  | { kind: 'InvalidSerializedSpecialValue'; value: string }
  | { kind: 'DuplicatedCustomTypeName'; typeName: string };

const ZenjsonErreurInternal = createErreurStore<TZenjsonErreurData>();

export const ZenjsonErreur = ZenjsonErreurInternal.asReadonly;

export function throwCustomTypeNotFound(typeName: string): never {
  return ZenjsonErreurInternal.setAndThrow(`Unexpected: custom type "${typeName}" not found`, {
    kind: 'CustomTypeNotFound',
    typeName,
  });
}

export function throwKeyNotFound(keyName: string): never {
  return ZenjsonErreurInternal.setAndThrow(`Key "${keyName}" not found`, { kind: 'KeyNotFound', keyName });
}

export function throwUnexpectedSpecialValue(value: unknown): never {
  return ZenjsonErreurInternal.setAndThrow(`Unexpected special number value ${String(value)}`, {
    kind: 'UnexpectedSpecialValue',
    value,
  });
}

export function throwInvalidSerializedSpecialValue(value: string): never {
  return ZenjsonErreurInternal.setAndThrow(`Invalid serialized special number: ${value}`, {
    kind: 'InvalidSerializedSpecialValue',
    value,
  });
}

export function throwDuplicatedCustomTypeName(typeName: string): never {
  return ZenjsonErreurInternal.setAndThrow(`Invalid custom type list: duplicated type name: "${typeName}"`, {
    kind: 'DuplicatedCustomTypeName',
    typeName,
  });
}
