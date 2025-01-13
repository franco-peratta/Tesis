import twilio from "twilio"
const AccessToken = twilio.jwt.AccessToken
const { VideoGrant } = AccessToken

const config = {
	accountSid: process.env.TWILIO_ACCOUNT_SID || "",
	apiKey: process.env.TWILIO_API_KEY || "",
	apiSecret: process.env.TWILIO_API_SECRET || ""
}

export const generateToken = (identity: string) => {
	return new AccessToken(config.accountSid, config.apiKey, config.apiSecret, {
		identity
	})
}

export const videoToken = (identity: string, room: string) => {
	const videoGrant = new VideoGrant({ room })
	const token = generateToken(identity)
	token.addGrant(videoGrant)
	token.identity = identity
	return token
}
