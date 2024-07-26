import { assertStringNotEmpty, createArrayParser } from '@unshared/validation'

export const assertContactSocials = createArrayParser({
  type: assertStringNotEmpty,
  url: assertStringNotEmpty,
})
