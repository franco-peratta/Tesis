import { Appointment } from "../Appointments/model"

export interface Patient {
  id: string
  name: string
  dni: string
  dob: string
  phoneNumber: string | null
  emr: string
  email?: string
}

export interface PatientWithAppointments {
  id: string
  name: string
  dni: string
  dob: string
  phoneNumber: string | null
  emr: string
  email?: string
  Appointment: Appointment[]
}
