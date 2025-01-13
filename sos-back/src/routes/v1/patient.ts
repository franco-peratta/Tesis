import express from "express"
const router = express.Router()

import {
	addPatient,
	getAll,
	getPatientById,
	updatePatient,
	updateEmr,
	deletePatient,
	getPatientByIdWithAppointments
} from "../../controllers/patient"

router.post("/", addPatient)

router.get("/:id", getPatientById)

router.get("/:id/appointments", getPatientByIdWithAppointments)

router.get("/", getAll)

router.put("/:id", updatePatient)

router.patch("/:id/emr", updateEmr)

router.delete("/:id", deletePatient)

export default router
