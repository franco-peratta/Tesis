import { Appointment } from "../Appointments/model"

export interface Patient {
  id: number
  name: string
  dni: string
  dob: string
  phoneNumber: string | null
  emr: string
  email?: string
}

export interface PatientWithAppointments {
  id: number
  name: string
  dni: string
  dob: string
  phoneNumber: string | null
  emr: string
  email?: string
  Appointment: Appointment[]
}
