import express from "express"
import routes from "./src/routes/index"
import * as dotenv from "dotenv"
import cors, { CorsOptions } from "cors"
import morgan from "morgan"

const app = express()

// init dotenv
dotenv.config()

//PORT
app.set("port", 3000)

// CORS
const corsOptions: CorsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = [
			"https://tesis-sable.vercel.app",
		];

		// Allow localhost from any port (e.g., http://localhost:3000, 5173, etc.)
		const isLocalhost = origin?.startsWith("http://localhost");

		if (!origin || allowedOrigins.includes(origin) || isLocalhost) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders:
		"Content-Type, Authorization, Content-Length, X-Requested-With, Accept"
};

app.use(cors(corsOptions))

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined"))

//routes
app.use("/", routes)

app.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on ${process.env.HOST}:${process.env.PORT || 3000}`)
})
