/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express"
import * as repo from "../repos/provider"

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await repo.getAll()
		res.json({ data })
	} catch (error) {
		console.error(error)
		res.json({ msg: "Error, no se pudo obtener los provedores", error })
	}
}

export const getProviderById = async (req: Request, res: Response) => {
	const providerId = parseInt(req.params.id)
	try {
		const data = await repo.getProviderById(providerId)

		res.json({ msg: "provider obetenido exitosamente", data })
	} catch (error) {
		console.error(error)
		res.json({ msg: "Error, no se pudo obtener el provedor", error })
	}
}

export const addProvider = async (req: Request, res: Response) => {
	const provider = req.body
	try {
		const data = await repo.addProvider(provider)
		res.json({ msg: "Provedor agregado exitosamente!", data: data.id })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "Error: El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado al agregar el provedor", error })
		}
		console.error(error)
	}
}

export const updateProvider = async (req: Request, res: Response) => {
	const providerId = parseInt(req.params.id)
	const updatedProvider = req.body
	try {
		const data = await repo.updateProvider(providerId, updatedProvider)
		res.json({ msg: "provedor actualizado exitosamente", data })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "Error: El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado al actualizar el proveedor", error })
		}
		console.error(error)
	}
}

export const deleteProvider = async (req: Request, res: Response) => {
	const providerId = parseInt(req.params.id)
	try {
		const data = await repo.deleteProvider(providerId)
		res.json({ msg: "provedor eliminado con exito", data })
	} catch (error) {
		console.error(error)
		res
			.status(500)
			.json({ msg: "Error, no se pudo eliminar el provedor", error })
	}
}
