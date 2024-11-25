import { DataSource } from 'typeorm'
import { isDataSource } from './isDataSource'

describe('isDataSource', () => {
  test('should return true for a DataSource instance', () => {
    const value = new DataSource({ type: 'sqlite', database: ':memory:', entities: [] })
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
})
