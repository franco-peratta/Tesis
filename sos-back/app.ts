import express from "express"
import routes from "./src/routes/index"
import * as dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"

const app = express()

// init dotenv
dotenv.config()

//PORT
app.set("port", 3000)

// CORS
const corsOptions = {
	origin: "*",
	optionsSuccessStatus: 200,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	preflightContinue: false,
	credentials: true,
	allowedHeaders:
		"Content-Type, Authorization, Content-Length, X-Requested-With, Accept"
}
app.use(cors(corsOptions))

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined"))

//routes
app.use("/", routes)

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on http://localhost:${process.env.PORT || 3000}`)
})
