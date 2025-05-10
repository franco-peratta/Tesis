import dayjs from 'dayjs'
import { http } from "../http"
import { type Status, type Appointment, NewAppointmentDto } from "./model"
import { type Provider } from "../Provider/model"
import { Patient } from "../Patient/model"

export const getAppointments = () => {
	return http<Appointment[]>("GET", "/appointment")
}

export const getAppointmentById = (id: string) => {
	return http<Appointment>("GET", `/appointment/${id}`)
}

export const getAppointmentsByPatientId = (id: string) => {
	return http<Appointment[]>("GET", `/appointment/patient/${id}`)
}

export const getAppointmentsByProviderId = (id: string) => {
	return http<Appointment[]>("GET", `/appointment/provider/${id}`)
}

export const getUpcomingAppointmentsByProviderId = (id: string) => {
	return http<Appointment[]>("GET", `/appointment/provider/${id}?status=en_progreso,espera`)
}

export const getProvidersList = () => {
	return http<Provider[]>("GET", `/provider`)
}

export const addAppointment = (appointment: NewAppointmentDto) => {
	return http<Appointment>("POST", "/appointment/", {
		params: appointment
	})
}

export const deleteAppointment = (id: string) => {
	return http<Appointment>("DELETE", `/appointment/${id}`)
}

export const changeAppointmentStatusById = (
	appointmentId: string,
	status: Status
) => {
	return http<Appointment>("PATCH", `/appointment/${appointmentId}`, {
		params: { status }
	})
}

export const getOccupiedSlots = (providerId: string, date: dayjs.Dayjs) => {
	return http<string[]>(
		"GET",
		`/appointment/slots/${providerId}?date=${date.format("YYYY-MM-DD")}`
	)
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

export const getPatients = async () => {
	return http<Patient[]>("GET", "/patient")
}