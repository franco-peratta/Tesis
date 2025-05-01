import { PrismaClient } from "@prisma/client"
import type { User, } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export const createUser = async (
	email: string,
	password: string,
	role: string
): Promise<User> => {
	const hashedPassword = await bcrypt.hash(password, 10)
	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			role: role
		}
	})
	return user
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
	const user = await prisma.user.findUnique({
		where: {
			email: email
		}
	})
	return user
}

export const getUserById = async (id: number): Promise<User | null> => {
	const user = await prisma.user.findUnique({
		where: {
			id
		}
	})
	return user
}
