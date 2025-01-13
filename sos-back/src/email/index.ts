import nodemailer from "nodemailer"
import fs from "fs"

const emailAddress = "franco.peratta20@gmail.com"

const emailTemplateMapping = {
	test: "test_template.html",
	appointment_created: "appointment_created.html",
	reminder: "test_template.html"
}

type EmailType = keyof typeof emailTemplateMapping

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
	service: "Gmail",
	auth: {
		user: emailAddress,
		pass: "luve wvsv dywa xtox"
	}
})

// Function to send the email
export function sendEmail(
	to: string,
	subject: string,
	type: EmailType = "test",
	data: any = {}
) {
	// Read the HTML template file and convert it to a string
	let emailTemplate = fs.readFileSync(
		`src/email/templates/${emailTemplateMapping[type]}`,
		"utf-8"
	)

	if (data) {
		Object.keys(data).forEach((key) => {
			emailTemplate = emailTemplate.replace(`{{${key}}}`, data[key])
		})
	}

	const mailOptions = {
		from: emailAddress,
		to,
		subject,
		html: emailTemplate
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Error sending email: ", error)
		} else {
			console.log("Email sent: ", info.response)
		}
	})
}
