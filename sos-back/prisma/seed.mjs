/* eslint-disable @typescript-eslint/no-unused-vars */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function cleanDB() {
	await prisma.appointment.deleteMany()
	await prisma.provider.deleteMany()
	await prisma.patient.deleteMany()
	await prisma.user.deleteMany()
}

const shifts = JSON.stringify({
	monday: {
		available: true,
		shifts: [
			{ from: 9, to: 13 },
			{ from: 14, to: 18 }
		]
	},
	tuesday: {
		available: true,
		shifts: [{ from: 12, to: 16 }]
	},
	wednesday: {
		available: false,
		shifts: []
	},
	thursday: {
		available: true,
		shifts: [
			{ from: 10, to: 14 },
			{ from: 15, to: 19 }
		]
	},
	friday: {
		available: true,
		shifts: [
			{ from: 8, to: 12 },
			{ from: 13, to: 17 }
		]
	},
	saturday: {
		available: false,
		shifts: []
	},
	sunday: {
		available: false,
		shifts: []
	}
})

async function seed() {
	await cleanDB()

	const { provider: cami } = await prisma.user.create({
		data: {
			email: "cami@mail.com",
			password: await bcrypt.hash("password", 10),
			role: "provider",
			provider: {
				create: {
					name: "Camila Aguirre",
					shifts
				}
			}
		},
		select: {
			provider: {
				select: {
					id: true
				}
			}
		}
	})

	const { provider: marcos } = await prisma.user.create({
		data: {
			email: "marcos@mail.com",
			password: await bcrypt.hash("password", 10),
			role: "provider",
			provider: {
				create: {
					name: "Marcos Zani",
					shifts
				}
			}
		},
		select: {
			provider: {
				select: {
					id: true
				}
			}
		}
	})

	const { patient: franco } = await prisma.user.create({
		data: {
			email: "franco.peratta@hotmail.com",
			password: await bcrypt.hash("password", 10),
			role: "patient",
			patient: {
				create: {
					name: "Franco Peratta",
					dni: "38919769",
					dob: "1995-06-20",
					phoneNumber: "2914628934",
					emr: ""
				}
			}
		},
		select: {
			patient: {
				select: {
					id: true
				}
			}
		}
	})

	for (let i = 0; i < 10; i++) {
		await prisma.user.create({
			data: {
				email: "user" + i + "@mail.com",
				password: await bcrypt.hash("password", 10),
				role: "patient",
				patient: {
					create: {
						name: "Paciente de Prueba " + i,
						dni: "DNI: " + i,
						dob: "1995-06-20",
						phoneNumber: "2914628934",
						emr: ""
					}
				}
			}
		})
	}

	const { patient: lucas } = await prisma.user.create({
		data: {
			email: "lucas@mail.com",
			password: await bcrypt.hash("password", 10),
			role: "patient",
			patient: {
				create: {
					name: "Lucas Peratta",
					dni: "42123456",
					dob: "2022-01-09",
					phoneNumber: "123456789",
					emr: ""
				}
			}
		},
		select: {
			patient: {
				select: {
					id: true
				}
			}
		}
	})

	await prisma.appointment.create({
		data: {
			status: "espera",
			date: new Date().toISOString().split("T")[0],
			time: "14:00",
			duration: 30,
			patient: {
				connect: { id: franco.id }
			},
			provider: {
				connect: { id: cami.id }
			}
		}
	})
	await prisma.appointment.create({
		data: {
			status: "espera",
			date: new Date().toISOString().split("T")[0],
			time: "15:00",
			duration: 30,
			patient: {
				connect: { id: franco.id }
			},
			provider: {
				connect: { id: marcos.id }
			}
		}
	})
	await prisma.appointment.create({
		data: {
			status: "espera",
			date: new Date().toISOString().split("T")[0],
			time: "16:00",
			duration: 30,
			patient: {
				connect: { id: lucas.id }
			},
			provider: {
				connect: { id: cami.id }
			}
		}
	})
}

seed()
	.then(() => console.log("Database seeded!"))
	.catch((e) => console.error(e))
	.finally(async () => {
		await prisma.$disconnect()
	})
