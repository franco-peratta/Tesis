import { Patient } from "../Patient/model"
import { Provider } from "../Profile/Model"

export const Status = {
  espera: "espera",
  en_progreso: "en_progreso",
  terminado: "terminado",
  cancelado: "cancelado"
} as const

export type AppointmentStatus = (typeof Status)[keyof typeof Status]

export type Appointment = {
  id: string
  status: AppointmentStatus
  date: string
  time: string
  duration: number
  patient?: Patient
  provider?: Provider
}

export const statusColorMapping = {
  espera: "blue",
  en_progreso: "yellow",
  terminado: "green",
  cancelado: "red"
}
