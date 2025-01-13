import { http } from "../http"
import { Patient } from "./model"

export const getPatientById = async (patientId: string) => {
	return http<Patient>("GET", `/patient/${patientId}`)
}

export const updatePatient = async (patient: Partial<Patient>) => {
	return http<Patient>("PUT", `/patient/${patient.id}`, { params: patient })
}
