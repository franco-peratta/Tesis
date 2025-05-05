import { Patient, Provider, User } from "@prisma/client"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { getUserByEmail } from "../repos/user"
import { addPatient } from "../repos/patient"
import { addProvider } from "../repos/provider"

const JWT_SECRET = process.env.JWT_SECRET || "secret"
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "3h"

type TPatientUser = Omit<User & Patient, "id">
type TProviderUser = Omit<User & Provider, "id">

export const login = async (req: Request, res: Response) => {
	const { email, password, role } = req.body

	if (!email || !password) {
		return res
			.status(400)
			.send({ error: "Correo electronico o contraseña incompletos" })
	}

	const user = await getUserByEmail(email)

	if (!user) {
		return res.status(401).send({ error: "Credenciales Incorrectas" })
	}

	const passwordMatch = await bcrypt.compare(password, user.password)

	if (!passwordMatch) {
		return res.status(401).send({ error: "Credenciales Incorrectas" })
	}

	const jwt_body = {
		id: user.id,
		email: user.email,
		role: user.role
	}

	const token = jwt.sign(jwt_body, JWT_SECRET, {
		algorithm: "HS512",
		expiresIn: JWT_EXPIRATION,
		notBefore: "0s",
		audience: req.hostname,
		issuer: req.hostname,
		subject: user.id.toString()
	})

	const userToReturn = {
		id: user.id,
		email: user.email,
		role: user.role,
	}

	res.send({ data: { token, user: userToReturn } })
}

export const register = async (req: Request, res: Response) => {
	try {
		const { email, role } = req.body

		const user = await getUserByEmail(email)

		if (user) {
			console.error("El usuario ya existe", email)
			return res.status(409).send({ error: "El usuario ya existe" })
		}

		let id

		if (role === "patient") {
			id = await createPatientUser(req.body as TPatientUser)
		} else {
			if (role === "provider") {
				id = await createProviderUser(req.body as TProviderUser)
			}
			else {
				res.status(400).send({ message: "El rol no existe" })
			}
		}

		res.status(201).send({ data: { id }, message: "Usuario creado con exito" })
	} catch (error) {
		console.log(error)
		if (error instanceof Error && error.message.includes("prisma")) {
			res.statusMessage = "Datos invalidos"
			return res.status(400).end()
		}
		res.statusMessage = "Algo salio mal"
		res.status(500).end()
	}
}

const createPatientUser = async (data: TPatientUser) => {
	const hashedPassword = await bcrypt.hash(data.password, 10)

	const newUser = {
		email: data.email,
		password: hashedPassword,
		role: "patient",
		name: data.name,
		dni: data.dni,
		dob: data.dob,
		created_at: new Date(),
		phoneNumber: data.phoneNumber,
		emr: ""
	}

	const user = await addPatient(newUser)
	return user.id
}

const createProviderUser = async (data: TProviderUser) => {
	const hashedPassword = await bcrypt.hash(data.password, 10)

	const newUser: TProviderUser = {
		email: data.email,
		password: hashedPassword,
		role: "provider",
		created_at: new Date(),
		name: data.name,
		shifts: data.shifts,
		phoneNumber: data.phoneNumber
	}

	const user = await addProvider(newUser)
	return user.id
}
