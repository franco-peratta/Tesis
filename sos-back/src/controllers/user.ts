/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/db"
import { Request, Response } from "express"
import bcrypt from "bcrypt"

// Campos que se pueden devolver al cliente. La contraseña nunca sale de la
// base: antes se serializaba el registro completo, hashes incluidos.
const publicUserFields = {
	id: true,
	email: true,
	role: true,
	created_at: true
}

export const getAll = async (req: Request, res: Response) => {
	try {
		const data = await prisma.user.findMany({ select: publicUserFields })
		res.json({ data })
	} catch (error) {
		res.json({ msg: "Error, no se pudieron obtener los usuarios", error })
		console.error(error)
	}
}

export const getUserById = async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id)
	try {
		const data = await prisma.user.findUniqueOrThrow({
			where: {
				id: userId
			},
			select: publicUserFields
		})

		res.json({ msg: "Usuario obtenido con éxito", data })
	} catch (error) {
		res.json({ msg: "Error, no se pudo obtener el usuario", error })
		console.error(error)
	}
}

export const updateUser = async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id)
	const { email, password } = req.body
	try {
		const data = await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				email,
				// El rol no es editable por el propio usuario: permitirlo dejaba
				// que un paciente se convirtiera en médico.
				// La contraseña se hashea antes de guardarla, igual que en los
				// repos. Guardarla en texto plano rompía el login.
				...(password ? { password: await bcrypt.hash(password, 10) } : {})
			},
			select: publicUserFields
		})
		res.json({ msg: "Usuario actualizado con éxito", data })
	} catch (error: any) {
		if (error.code === "P2002" && error.meta?.target?.includes("email")) {
			res.status(409).json({ msg: "Error: El email ya está en uso", error })
		} else {
			res
				.status(500)
				.json({ msg: "Error, no se pudo actualizar el usuario", error })
		}
	}
}

export const deleteUser = async (req: Request, res: Response) => {
	const userId = parseInt(req.params.id)

	try {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: userId
			},
			include: {
				patient: true,
				provider: true
			}
		})

		// El perfil (patient/provider) referencia al usuario, así que hay que
		// borrarlo primero — sus turnos se van en cascada. Al revés, la baja
		// fallaba con P2003 sin borrar nada.
		await prisma.$transaction(async (tx) => {
			if (user.patient) {
				await tx.patient.delete({ where: { id: user.patient.id } })
			}

			if (user.provider) {
				await tx.provider.delete({ where: { id: user.provider.id } })
			}

			await tx.user.delete({ where: { id: userId } })
		})

		res.status(204).end()
	} catch (error: any) {
		console.error(error)

		if (error.code === "P2025") {
			return res.status(404).json({ error: "Usuario no encontrado" })
		}

		res.status(500).json({ error: "Algo salio mal.." })
	}
}
