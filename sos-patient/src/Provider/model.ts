export interface Provider {
  id: number
  name: string
  shifts: string
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