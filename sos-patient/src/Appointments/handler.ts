import { http } from "../http"
import { Status, type Appointment } from "./model"

export const getAppointmentsByPatientId = async (patientId: string) => {
	return await http<Appointment[]>("GET", `/appointment/patient/${patientId}`)
}

export const updateAppointmentStatus = async (
	id: string,
	status: Status
) => {
	return await http<Appointment>("PATCH", `/appointment/${id}`, {
		params: {
			status
		}
	})
}
