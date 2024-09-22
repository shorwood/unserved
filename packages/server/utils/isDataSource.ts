import { DataSource } from 'typeorm'

export function isDataSource(value: unknown): value is DataSource {
  return value instanceof DataSource
    || typeof value === 'object'
    && value !== null
    && '@instanceOf' in value
    && value['@instanceOf'] === Symbol.for('DataSource')
}

/* v8 ignore start */
if (import.meta.vitest) {
  test('should return true for a DataSource instance', () => {
    const value = new DataSource({ type: 'better-sqlite3', database: ':memory:', entities: [] })
    const result = isDataSource(value)
    expect(result).toBe(true)
  })

  test('should return true for a DataSource object', () => {
    const value = { '@instanceOf': Symbol.for('DataSource') }
    const result = isDataSource(value)
    expect(result).toBe(true)
  })

  test('should return false for a non-DataSource instance', () => {
    const value = { type: 'better-sqlite3', database: ':memory:', entities: [] }
    const result = isDataSource(value)
    expect(result).toBe(false)
  })
}
