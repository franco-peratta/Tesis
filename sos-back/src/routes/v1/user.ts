import express from "express"
const router = express.Router()

import { deleteUser, getUserById, updateUser } from "../../controllers/user"
import { requireSelf } from "../../middlewares/auth"

// No se expone un listado de usuarios: no tiene consumidor en las apps y
// devolvía todos los registros a cualquier usuario autenticado. Cuando exista
// el rol de administrador, debe montarse detrás de una comprobación de rol.

router.get("/:id", requireSelf, getUserById)

router.put("/:id", requireSelf, updateUser)

router.delete("/:id", requireSelf, deleteUser)

export default router
