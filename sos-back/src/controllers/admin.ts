/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/db"
import { Request, Response } from "express"
import bcrypt from "bcrypt"

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await prisma.admin.findMany()
		res.json({ data })
	} catch (error) {
		res.status(500).json({ msg: "Error al obterner los admins", error })
		console.log(error)
	}
}

export const getAdminById = async (req: Request, res: Response) => {
	const adminId = parseInt(req.params.id)
	try {
		const data = await prisma.admin.findUniqueOrThrow({
			where: {
				id: adminId
			}
		})

		res.json({ msg: "Admin obtenido con exito", data })
	} catch (error) {
		res.json({ msg: "Error al obtener el admin", error })
		console.log(error)
	}
}

export const addAdmin = async (req: Request, res: Response) => {
	const admin = req.body

	const randomPassword = Math.random().toString(36).slice(-8)

	try {
		const newAdmin = await prisma.admin.create({
			data: {
				name: admin.name,
				user: {
					create: {
						email: admin.email,
						password: await bcrypt.hash(admin.password || randomPassword, 10),
						role: "admin"
					}
				}
			}
		})
		res.json({ msg: "Admin agregado exitosamente!", data: newAdmin.id })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado al agregar el admin", error })
		}
		console.error(error)
	}
}

export const updateAdmin = async (req: Request, res: Response) => {
	const adminId = parseInt(req.params.id)
	const updatedAdmin = req.body
	try {
		const data = await prisma.admin.update({
			where: {
				id: adminId
			},
			data: {
				name: updatedAdmin.name
			}
		})
		res.json({ msg: "Admin actualizado exitosamente", data })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error inesperado al actualizar el admin", error })
		}
		console.error(error)
	}
}

export const deleteAdmin = async (req: Request, res: Response) => {
	const adminId = parseInt(req.params.id)
	try {
		const admin = await prisma.admin.delete({
			where: {
				id: adminId
			}
		})
		res.json({ msg: "Admin eliminado exitosamente", data: admin.id })
	} catch (error) {
		res.status(500).json({ msg: "Error, no se pudo eliminar el admin", error })
		console.log(error)
	}
}
