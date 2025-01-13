import express from "express"
const router = express.Router()

import {
	addAppointment,
	getAll,
	getAppointmentById,
	getAppointmentsByPatientId,
	getAppointmentsByProviderId,
	updateAppointmentStatus,
	deleteAppointment,
	updateAppointment,
	getOccupiedSlots
} from "../../controllers/appointment"

router.post("/", addAppointment)

router.get("/:id", getAppointmentById)

router.get("/patient/:id", getAppointmentsByPatientId)

router.get("/provider/:id", getAppointmentsByProviderId)

router.get("/", getAll)

router.put("/:id", updateAppointment)

router.patch("/:id", updateAppointmentStatus)

router.delete("/:id", deleteAppointment)

router.get("/slots/:provider_id", getOccupiedSlots)

export default router
