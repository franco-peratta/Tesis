import { range } from '../Appointments/utils'

describe('range', () => {
  it('generates an array from start (inclusive) to end (exclusive)', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4])
  })

  it('generates time-slot indices starting at zero', () => {
    expect(range(0, 4)).toEqual([0, 1, 2, 3])
  })

  it('returns an empty array when start equals end', () => {
    expect(range(3, 3)).toEqual([])
  })

  it('returns an empty array when start is greater than end', () => {
    expect(range(5, 2)).toEqual([])
  })

  it('generates a single-element array when the range spans one step', () => {
    expect(range(7, 8)).toEqual([7])
  })
})
