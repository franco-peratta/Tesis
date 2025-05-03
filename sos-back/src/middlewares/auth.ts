import { User } from "@prisma/client"
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
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
