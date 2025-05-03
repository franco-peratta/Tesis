import { prisma } from "../config/db"
import { Request, Response } from "express"
import {
	getAllAppointments,
	getById,
	getByPatientId,
	getByProviderId
} from "../repos/appointment"
import { Appointment, Provider } from "@prisma/client"
import { sendEmail } from "../email"

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await getAllAppointments()
		res.json({ data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener los turnos", error })
		console.error(error)
	}
}

export const getAppointmentById = async (req: Request, res: Response) => {
	const appointmentId = req.params.id
	try {
		const data = await getById(appointmentId)
		res.json({ msg: "Turno obtenido con exito", data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener el turno", error })
		console.error(error)
	}
}

export const getAppointmentsByPatientId = async (
	req: Request,
	res: Response
) => {
	const patientId = parseInt(req.params.id)
	try {
		const data = await getByPatientId(patientId)
		res.json({ msg: "Turno obtenido con exito", data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener el turno", error })
		console.error(error)
	}
}

export const getAppointmentsByProviderId = async (
	req: Request,
	res: Response
) => {
	const providerId = parseInt(req.params.id)
	try {
		const data = await getByProviderId(providerId)
		res.json({ msg: "Turno obtenido con exito", data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener el turno", error })
		console.error(error)
	}
}

export const addAppointment = async (req: Request, res: Response) => {
	const appointment = req.body
	try {
		const new_appointment = await prisma.appointment.create({
			data: {
				date: appointment.date,
				time: appointment.time,
				status: appointment.status,
				patient: {
					connect: {
						id: appointment.patientId
					}
				},
				provider: {
					connect: {
						id: appointment.providerId
					}
				}
			}
		})

		sendAppointmentCreationEmail(new_appointment)

		res.json({ msg: "Turno agregado con éxito", new_appointment })
	} catch (error) {
		res.status(500).json({ msg: "Error, no se pudo agregar el turno", error })
		console.error(error)
	}
}

export const updateAppointment = async (req: Request, res: Response) => {
	const appointmentId = req.params.id
	const updatedAppointment = req.body
	try {
		const data = await prisma.appointment.update({
			where: {
				id: appointmentId
			},
			data: {
				patientId: updatedAppointment.patienId,
				providerId: updatedAppointment.providerId,
				date: updatedAppointment.data,
				time: updatedAppointment.time,
				status: updatedAppointment.status
			}
		})
		res.json({ msg: "Turno actualizado con éxito", data })
	} catch (error) {
		res
			.status(500)
			.json({ msg: "Error, no se pudo actualizar el turno", error })
		console.error(error)
	}
}

export const updateAppointmentStatus = async (req: Request, res: Response) => {
	const appointmentId = req.params.id
	const { status } = req.body
	try {
		const data = await prisma.appointment.update({
			where: {
				id: appointmentId
			},
			data: {
				status: status
			}
		})
		res.json({ msg: "Estado del turno actualizado con éxito", data })
	} catch (error) {
		res
			.status(500)
			.json({ msg: "Error, no se pudo actualizar el estado del turno", error })
		console.error(error)
	}
}

export const deleteAppointment = async (req: Request, res: Response) => {
	const appointmentId = req.params.id
	try {
		const appointment = await prisma.appointment.delete({
			where: {
				id: appointmentId
			}
		})
		res.json({ msg: "Turno eliminado con éxito", data: appointment.id })
	} catch (error) {
		res.status(500).json({ msg: "Error, no se pudo eliminar el turno", error })
		console.error(error)
	}
}

export const getOccupiedSlots = async (req: Request, res: Response) => {
	const providerId = parseInt(req.params.provider_id)
	const date = req.query.date as string

	try {
		const provider = await prisma.provider.findUnique({
			where: {
				id: providerId
			},
			include: {
				Appointment: {
					where: {
						date
					}
				}
			}
		})
		if (!provider) {
			res.json({ msg: "Proveedor no encontrado" })
			return
		}

		const occupiedSlots = calculateSlots(provider, date)

		res.json({
			msg: "Turnos ocupados recuperados con éxito",
			data: occupiedSlots
		})
	} catch (error) {
		res.status(500).json({
			msg: "Error, no se pudieron recuperar los turnos ocupados",
			error
		})
		console.error(error)
	}
}

const calculateSlots = (
	provider: Provider & { Appointment: Appointment[] },
	dateStr: string
) => {
	if (!provider.Appointment.length) {
		return []
	}

	const dateArr = dateStr.split("-")
	const year = parseInt(dateArr[0])
	const month = parseInt(dateArr[1]) - 1
	const day = parseInt(dateArr[2])
	const date = new Date(year, month, day)

	const daysOfWeek = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday"
	] as const
	type DaysOfTheWeek = (typeof daysOfWeek)[number]
	const currentDayName = daysOfWeek[date.getDay()] as DaysOfTheWeek

	const providerWholeShift = JSON.parse(provider.shifts) as Shifts

	const shifts = providerWholeShift[currentDayName].shifts

	const slots = new Map<string, boolean>()

	shifts.forEach((shift) => {
		const from = shift.from
		const to = shift.to - 1
		let current = from
		while (current <= to) {
			for (let i = 0; i < 60; i += 5) {
				const mins = i < 10 ? `0${i}` : i
				const time = `${current}:${mins}`
				slots.set(time, true)
			}
			current++
		}
	})

	provider.Appointment.forEach((app) => {
		const { time, duration } = app

		const timeArr = time.split(":")
		const hour = parseInt(timeArr[0])
		const mins = parseInt(timeArr[1])

		const durationInSlots = duration / 5

		let current = hour
		let currentMins = mins
		let slotsToBook = durationInSlots

		while (slotsToBook > 0) {
			const mins = currentMins < 10 ? `0${currentMins}` : currentMins
			const time = `${current}:${mins}`

			slots.set(time, false)
			currentMins += 5
			if (currentMins >= 60) {
				currentMins = 0
				current++
			}
			slotsToBook--
		}
	})

	const occupiedSlots: string[] = []
	for (const [key, value] of slots.entries()) {
		if (!value) {
			occupiedSlots.push(key)
		}
	}

	return occupiedSlots
}

type Shift = { from: number; to: number }
type Shifts = {
	monday: {
		available: boolean
		shifts: Shift[]
	}
	tuesday: {
		available: boolean
		shifts: Shift[]
	}
	wednesday: {
		available: boolean
		shifts: Shift[]
	}
	thursday: {
		available: boolean
		shifts: Shift[]
	}
	friday: {
		available: boolean
		shifts: Shift[]
	}
	saturday: {
		available: boolean
		shifts: Shift[]
	}
	sunday: {
		available: boolean
		shifts: Shift[]
	}
}

const sendAppointmentCreationEmail = async (appointment: Appointment) => {
	const patient = await prisma.patient.findUnique({
		where: {
			id: appointment.patientId
		},
		include: {
			user: {
				select: {
					email: true
				}
			}
		}
	})

	const provider = await prisma.provider.findUnique({
		where: {
			id: appointment.providerId
		},
		select: {
			name: true
		}
	})
	console.error("ESTOY POR MANDAR EL MAIL")
	if (patient && patient.user?.email) {
		sendEmail(
			patient.user?.email,
			"Appointment created",
			"appointment_created",
			{
				nombre: patient.name,
				medico: provider?.name || "Desconocido",
				fecha: appointment.date,
				appointment_id: appointment.id
			}
		)
	} else {
		console.error("No se pudo enviar el correo: el paciente no se encontró.")
	}
}
