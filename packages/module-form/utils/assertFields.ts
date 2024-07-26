import {
  assertBoolean,
  assertNotUndefined,
  assertNumber,
  assertString,
  assertStringNotEmpty,
  assertUndefined,
  createArrayParser,
} from '@unshared/validation'

export const assertFields = createArrayParser({
  name: assertStringNotEmpty,
  type: assertStringNotEmpty,
  description: [[assertUndefined], [assertString]],
  placeholder: [[assertUndefined], [assertString]],
  maxValue: [[assertUndefined], [assertNumber]],
  minValue: [[assertUndefined], [assertNumber]],
  step: [[assertUndefined], [assertNumber]],
  maxSize: [[assertUndefined], [assertNumber]],
  accept: [[assertUndefined], [assertString]],
  isMultiple: [[assertUndefined], [assertBoolean]],
  isRequired: [[assertUndefined], [assertBoolean]],
  defaultValue: [[assertUndefined], [assertNotUndefined]],
  values: [[assertUndefined], [createArrayParser({
    label: assertStringNotEmpty,
    value: assertStringNotEmpty,
    description: [[assertUndefined], [assertString]],
  })]],
})
