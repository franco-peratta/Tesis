import { http } from "../http"
import { Status, type Appointment } from "./model"

export const getAppointmentsByPatientId = async (patientId: string) => {
	return await http<Appointment[]>("GET", `/appointment/patient/${patientId}`)
}

export const updateAppointmentStatus = async (
	appointment: Appointment,
	status: Status = "en_progreso"
) => {
	return await http<Appointment>("PATCH", `/appointment/${appointment.id}`, {
		params: {
			status
		}
	})
}
