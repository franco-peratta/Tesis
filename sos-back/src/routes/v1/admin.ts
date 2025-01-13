import express from "express"
const router = express.Router()

import {
	addAdmin,
	getAll,
	getAdminById,
	updateAdmin,
	deleteAdmin
} from "../../controllers/admin"

router.post("/", addAdmin)

router.get("/", getAll)

router.get("/:id", getAdminById)

router.put("/:id", updateAdmin)

router.delete("/:id", deleteAdmin)

export default router
