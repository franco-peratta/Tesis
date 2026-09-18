import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "@prisma/client"
import { getUserById } from "../repos/user"

const JWT_SECRET = process.env.JWT_SECRET || "secret"

type JWT = {
	id: number
	email: string
	isAdmin: boolean
	iat: number
	nbf: number
	exp: number
	aud: string
	iss: string
	sub: string
}

export async function auth(
	req: Request & { user?: User },
	res: Response,
	next: NextFunction
) {
	const token = req.header("Authorization")?.replace("Bearer ", "")

	if (!token) {
		return res.status(401).send({ error: "Authentication failed" })
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET, {
			ignoreExpiration: false,
			ignoreNotBefore: true
		}) as JWT

		const user = await getUserById(decoded.id)

		if (!user) {
			throw new Error()
		}

		req.user = user
		next()
	} catch (error) {
		console.error(error)
		res.status(401).send({ error: "Authentication failed" })
	}
}

/**
 * Restringe la ruta al propio usuario autenticado. Mientras no exista un rol
 * de administrador, nadie tiene motivo para leer ni modificar la cuenta de
 * otro: sin esta comprobación, cualquier usuario logueado podía operar sobre
 * cualquier otro con solo cambiar el id de la URL.
 */
export function requireSelf(
	req: Request & { user?: User },
	res: Response,
	next: NextFunction
) {
	const targetId = parseInt(req.params.id)

	if (isNaN(targetId)) {
		return res.status(400).send({ error: "Id de usuario inválido" })
	}

	if (!req.user || req.user.id !== targetId) {
		return res.status(403).send({ error: "No autorizado" })
	}

	next()
}
