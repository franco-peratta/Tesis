import express from "express"
import { videoToken } from "./tokens"

const router = express.Router()

router.get("/", (req, res) => {
	const identity = req.query.identity
	const room = req.query.room as string

	if (!identity) return res.status(400).send("Identity is required")
	if (!room) return res.status(400).send("Room is required")

	const token = videoToken(identity as string, room)
	res.set("Content-Type", "application/json")
	res.send(
		JSON.stringify({
			token: token.toJwt()
		})
	)
})

export default router
