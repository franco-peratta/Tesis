import type { Patient } from "../Patient/model"
import type { Provider } from "../Provider/model"

export const Status = {
	espera: "espera",
	en_progreso: "en_progreso",
	terminado: "terminado",
	cancelado: "cancelado"
} as const

export type Status = keyof typeof Status

export interface Appointment {
	id: string
	status: Status
	date: string
	time: string
	patient: Patient
	provider: Provider
}

export interface NewAppointmentDto {
	status: Status
	date: string
	time: string
	patientId: number
	providerId: number
}
