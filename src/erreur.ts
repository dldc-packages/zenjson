import type { TKey } from '@dldc/erreur';
import { Erreur, Key } from '@dldc/erreur';

export type TZenjsonErreurData =
  | { kind: 'CustomTypeNotFound'; typeName: string }
  | { kind: 'KeyNotFound'; keyName: string }
  | { kind: 'UnexpectedSpecialValue'; value: unknown }
  | { kind: 'InvalidSerializedSpecialValue'; value: string }
  | { kind: 'DuplicatedCustomTypeName'; typeName: string };

export const ZenjsonErreurKey: TKey<TZenjsonErreurData, false> = Key.create<TZenjsonErreurData>('ZenjsonErreur');

export const ZenjsonErreur = {
  CustomTypeNotFound: (typeName: string) => {
    return Erreur.create(new Error('Unexpected: custom type not found'))
      .with(ZenjsonErreurKey.Provider({ kind: 'CustomTypeNotFound', typeName }))
      .withName('ZenjsonErreur');
  },
  KeyNotFound: (keyName: string) => {
    return Erreur.create(new Error(`Key ${keyName} not found`))
      .with(ZenjsonErreurKey.Provider({ kind: 'KeyNotFound', keyName }))
      .withName('ZenjsonErreur');
  },
  UnexpectedSpecialValue: (value: unknown) => {
    return Erreur.create(new Error(`Unexpected special number value ${String(value)}`))
      .with(ZenjsonErreurKey.Provider({ kind: 'UnexpectedSpecialValue', value }))
      .withName('ZenjsonErreur');
  },
  InvalidSerializedSpecialValue: (value: string) => {
    return Erreur.create(new Error(`Invalid serialized special number: ${value}`))
      .with(ZenjsonErreurKey.Provider({ kind: 'InvalidSerializedSpecialValue', value }))
      .withName('ZenjsonErreur');
  },
  DuplicatedCustomTypeName: (typeName: string) => {
    return Erreur.create(new Error(`Invalid custom type list: duplicated type name: "${typeName}"`))
      .with(ZenjsonErreurKey.Provider({ kind: 'DuplicatedCustomTypeName', typeName }))
      .withName('ZenjsonErreur');
  },
};
