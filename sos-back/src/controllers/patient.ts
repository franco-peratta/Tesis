/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express"
import * as repo from "../repos/patient"

export const getAll = async (_req: Request, res: Response) => {
	try {
		const data = await repo.getAllPatients()
		res.json({ data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo traer los pacientes", error })
		console.error(error)
	}
}

export const getPatientById = async (req: Request, res: Response) => {
	const patientId = parseInt(req.params.id)
	try {
		const data = await repo.getPatientById(patientId)

		res.json({ msg: "Paciente buscado con exito", data })
	} catch (error) {
		res.json({ msg: "Error, intente nuevamente", error })
		console.error(error)
	}
}

export const getPatientByIdWithAppointments = async (
	req: Request,
	res: Response
) => {
	const patientId = parseInt(req.params.id)
	try {
		const data = await repo.getPatientByIdWithAppointments(patientId)

		res.json({ msg: "Paciente buscado con exito", data })
	} catch (error) {
		res.json({ msg: "Error, intente nuevamente", error })
		console.error(error)
	}
}

export const addPatient = async (req: Request, res: Response) => {
	const patient = req.body

	try {
		const patientData = await repo.addPatient(patient)
		res.json({ msg: "Paciente agregado con exito", data: patientData.id })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "El email ya existe", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado. Intente de nuevo mas tarde", error })
		}
		console.error(error)
	}
}

export const updatePatient = async (req: Request, res: Response) => {
	const patientId = parseInt(req.params.id)
	const updatedPatient = req.body

	try {
		const data = await repo.updatePatient(patientId, updatedPatient)
		res.json({ msg: "Patient updated SUCCESSFULLY", data })
	} catch (error: any) {
		// Verifica si el error es por duplicidad de correo
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "Error: El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado al actualizar el paciente", error })
		}
		console.error(error)
	}
}

export const updateEmr = async (req: Request, res: Response) => {
	const patientId = parseInt(req.params.id)
	const { emr } = req.body
	console.error(emr)

	try {
		const data = await repo.updateEmr(patientId, emr)
		res.json({ msg: "Informe del paciente actualizado con exito", data })
	} catch (error) {
		res
			.status(500)
			.json({ msg: "Error inesperado al actualizar el informe.", error })
		console.error(error)
	}
}

export const deletePatient = async (req: Request, res: Response) => {
	const patientId = parseInt(req.params.id)
	try {
		const patient = await repo.deletePatient(patientId)
		res.json({ msg: "Paciente eliminado con exito!", data: patient.id })
	} catch (error) {
		res
			.status(500)
			.json({ msg: "Error inesperado al eliminar el paciente", error })
		console.error(error)
	}
}
