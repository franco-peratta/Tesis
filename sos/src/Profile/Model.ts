export type Provider = {
  id: number
  name: string
  shifts: Shifts
  email?: string
  phoneNumber: string | null
}

export type Shift = { from: number; to: number }

export type Shifts = {
  monday: {
    available: boolean
    shifts: Shift[]
  }
  tuesday: {
    available: boolean
    shifts: Shift[]
  }
  wednesday: {
    available: boolean
    shifts: Shift[]
  }
  thursday: {
    available: boolean
    shifts: Shift[]
  }
  friday: {
    available: boolean
    shifts: Shift[]
  }
  saturday: {
    available: boolean
    shifts: Shift[]
  }
  sunday: {
    available: boolean
    shifts: Shift[]
  }
}

const shifts = {
  monday: {
    available: true,
    shifts: [
      { from: 9, to: 13 },
      { from: 14, to: 18 }
    ]
  },
  tuesday: {
    available: true,
    shifts: [{ from: 12, to: 16 }]
  },
  wednesday: {
    available: false,
    shifts: []
  },
  thursday: {
    available: true,
    shifts: [
      { from: 10, to: 14 },
      { from: 15, to: 19 }
    ]
  },
  friday: {
    available: true,
    shifts: [
      { from: 8, to: 12 },
      { from: 13, to: 17 }
    ]
  },
  saturday: {
    available: false,
    shifts: []
  },
  sunday: {
    available: false,
    shifts: []
  }
}
