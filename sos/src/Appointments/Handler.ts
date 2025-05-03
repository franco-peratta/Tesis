import { Moment } from "moment"
import { Provider } from "../Profile/Model"
import { http } from "../http"
import { Appointment, AppointmentStatus } from "./model"

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

export const addAppointment = (appointment: Omit<Appointment, "id">) => {
  return http<Appointment>("POST", "/appointment/", {
    params: appointment
  })
}

export const deleteAppointment = (id: string) => {
  return http<Appointment>("DELETE", `/appointment/${id}`)
}

export const changeAppointmentStatusById = (
  appointmentId: string,
  status: AppointmentStatus
) => {
  return http<Appointment>("PATCH", `/appointment/${appointmentId}`, {
    params: { status }
  })
}

export const getOccupiedSlots = (providerId: string, date: Moment) => {
  return http<string[]>(
    "GET",
    `/appointment/slots/${providerId}?date=${date.format("YYYY-MM-DD")}`
  )
}
