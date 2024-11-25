import { DataSource } from 'typeorm'

export function isDataSource(value: unknown): value is DataSource {
  return value instanceof DataSource
    || typeof value === 'object'
    && value !== null
    && '@instanceOf' in value
    && value['@instanceOf'] === Symbol.for('DataSource')
}
