import { Patient, Provider, Appointment } from "@prisma/client"
import { prisma } from "../config/db"

export const getAllAppointments = async () => {
	const data = await prisma.appointment.findMany({
		orderBy: {
			date: 'asc',
		},
	})
	return data
}

export const getById = async (id: string) => {
	const data = await prisma.appointment.findUnique({
		include: {
			patient: true,
			provider: true
		},
		where: {
			id
		}
	})
	return data
}

export const getByPatientId = async (id: number) => {
	const data = await prisma.appointment.findMany({
		where: {
			patientId: id
		},
		include: {
			provider: true,
			patient: true
		},
		orderBy: {
			date: 'asc',
		},
	})
	return data
}

export const getByProviderId = async (id: number) => {
	const data = await prisma.appointment.findMany({
		where: {
			providerId: id
		},
		include: {
			provider: true,
			patient: true
		},
		orderBy: {
			date: 'asc',
		},
	})
	return data
}

export const getByProviderIdAndStatus = async (id: number, status_list: string[]) => {
	const data = await prisma.appointment.findMany({
		where: {
			providerId: id,
			status: {
				in: status_list,
			},
		},
		include: {
			provider: true,
			patient: true,
		},
		orderBy: {
			date: 'asc',
		},
	})
	return data
}
