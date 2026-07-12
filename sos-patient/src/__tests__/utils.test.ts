import { describe, it, expect } from 'vitest'
import { formatStatusName } from '../Appointments/utils'

describe('formatStatusName', () => {
  it('capitalizes the first letter of a plain status', () => {
    expect(formatStatusName('espera')).toBe('Espera')
  })

  it('replaces underscores with spaces and capitalizes first letter', () => {
    expect(formatStatusName('en_progreso')).toBe('En progreso')
  })

  it('handles multiple underscores', () => {
    expect(formatStatusName('a_b_c')).toBe('A b c')
  })

  it('returns an already-capitalized status unchanged (except underscore replacement)', () => {
    expect(formatStatusName('Completado')).toBe('Completado')
  })

  it('returns an empty string when given an empty string', () => {
    expect(formatStatusName('')).toBe('')
  })
})
