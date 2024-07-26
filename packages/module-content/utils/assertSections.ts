import { assertObject, assertString, createArrayParser } from '@unshared/validation'

export const assertSections = createArrayParser({
  kind: assertString,
  value: assertObject<Record<string, unknown>>,
})
