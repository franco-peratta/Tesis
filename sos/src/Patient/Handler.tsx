import { http } from "../http"
import { Patient, PatientWithAppointments } from "./model"

export const getPatients = async () => {
  return http<Patient[]>("GET", "/patient")
}

export const getPatientById = async (patientId: string) => {
  return http<Patient>("GET", `/patient/${patientId}`)
}

export const getPatientByIdWithAppointments = async (id: string) => {
  return http<PatientWithAppointments>("GET", `/patient/${id}/appointments`)
}

export const addPatient = async (patient: Omit<Patient, "id">) => {
  return http<Patient>("POST", "/patient", { params: patient })
}

export const updatePatient = async (patient: Partial<Patient>) => {
  return http<Patient>("PUT", `/patient/${patient.id}`, { params: patient })
}
