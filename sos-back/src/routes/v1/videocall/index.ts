import express from "express"
import twilioRouter from "./twilio/twilio"

const router = express.Router()

router.use("/twilio", twilioRouter)

export default router
