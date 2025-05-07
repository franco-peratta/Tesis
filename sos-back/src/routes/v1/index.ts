import { Router } from "express"

import appointmentRouter from "./appointment"
import patientRouter from "./patient"
import providerRouter from "./provider"
import userRouter from "./user"
import authRouter from "./auth"
import statsRouter from "./stats"
import { auth } from "../../middlewares/auth"

const router = Router()

// public routes
router.use("/auth", authRouter)

// protected routes
router.use("/patient", auth, patientRouter)
router.use("/provider", auth, providerRouter)
router.use("/appointment", auth, appointmentRouter)
router.use("/user", auth, userRouter)
router.use("/stats", auth, statsRouter)

export default router
