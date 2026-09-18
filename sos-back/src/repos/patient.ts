import { Patient, User } from "@prisma/client"
import { prisma } from "../config/db"
import bcrypt from "bcrypt"

export const getAllPatients = async () => {
	const data = await prisma.patient.findMany({
		include: {
			user: {
				select: {
					email: true
				}
			}
		},
		orderBy: {
			name: "asc"
		}
	})
	return data.map((patient) => ({
		...patient,
		email: patient.user.email
	}))
}

export const getPatientById = async (id: number) => {
	const patient = await prisma.patient.findUniqueOrThrow({
		where: {
			id
		},
		include: {
			user: {
				select: {
					email: true
				}
			}
		}
	})
	return { ...patient, email: patient.user.email }
}

export const getPatientByIdWithAppointments = async (id: number) => {
	const patient = await prisma.patient.findUniqueOrThrow({
		where: {
			id
		},
		include: {
			Appointment: {
				include: { provider: true },
				orderBy: {
					date: 'asc',
				},
			},
			user: {
				select: {
					email: true
				}
			}
		},
	})
	return { ...patient, email: patient.user.email }
}

export const addPatient = async (patient: Omit<User & Patient, "id">) => {
	// Contraseña inicial de los pacientes que da de alta un médico, ya que ese
	// formulario no pide contraseña. Se lee del entorno porque estaba escrita
	// en el código de un repositorio público, donde servía para entrar a
	// cualquier cuenta de paciente que no la hubiera cambiado.
	const password = patient.password || process.env.DEFAULT_PATIENT_PASSWORD

	if (!password) {
		throw new Error(
			"Falta la variable de entorno DEFAULT_PATIENT_PASSWORD para dar de alta un paciente sin contraseña"
		)
	}

	const emr = patient.emr && patient.emr.length > 0 ? patient.emr : emrTemplate

	const patientData = await prisma.patient.create({
		data: {
			name: patient.name,
			dni: patient.dni,
			dob: patient.dob,
			phoneNumber: patient.phoneNumber,
			emr,
			user: {
				create: {
					email: patient.email,
					password: await bcrypt.hash(password, 10),
					role: "patient"
				}
			}
		}
	})
	return patientData
}

export const updatePatient = async (id: number, patient: Patient) => {
	const data = await prisma.patient.update({
		where: {
			id
		},
		data: {
			name: patient.name,
			dni: patient.dni,
			emr: patient.emr,
			dob: patient.dob,
			phoneNumber: patient.phoneNumber
		}
	})
	return data
}

export const updateEmr = async (id: number, emr: string) => {
	const data = await prisma.patient.update({
		where: {
			id
		},
		data: {
			emr
		}
	})
	return data
}

export const deletePatient = async (id: number) => {
	const data = await prisma.patient.delete({
		where: {
			id
		}
	})
	return data
}

const emrTemplate = `
# 🧑‍⚕️ Expediente Clínico: 

- **Doctor(a):** 
- **Nacionalidad:** 
- **Fecha de Nacimiento:** 
- **Edad:**  
- **Sexo:** 
- **Obra Social / Seguro médico / Medicina Prepaga:** 
- **Número de Afiliado:** 


---

## 📋 Antecedentes Personales y Familiares

-   
- 

---

# Fecha de consulta: 

## 🔍 Motivo de Consulta

-

---

## 🩺 Examen Físico

| Medición          | Valor        |
|-------------------|--------------|
| Presión arterial  | XX mmHg  |
| Frecuencia cardíaca | XX lpm       |
| Temperatura       | XX °C       |
| Frecuencia respiratoria | XX rpm  |

---

## 🧪 Evolución

-
---

## 💊 Plan de Tratamiento

- Medicamentos recetados:  
  - **medicación XX mg** – Tomar cada N horas según necesidad  
- 

---

## ✅ Pendientes

- [x] Examen físico  
- [ ] Revisar análisis de sangre

---
`;