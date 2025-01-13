import express from "express"
const router = express.Router()

import {
	deleteUser,
	getAll,
	getUserById,
	updateUser
} from "../../controllers/user"

router.get("/", getAll)

router.get("/:id", getUserById)

router.put("/:id", updateUser)

router.delete("/:id", deleteUser)

export default router
