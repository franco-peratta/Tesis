import { useState } from "react"
import { Button, Form, Input, Layout, Image, Typography } from "antd"
import { http } from "../http"
import { useAuth } from "../hooks/useAuth"
import { useNavigate, Navigate } from "react-router-dom"
import { useNotifications } from "../hooks/useNotifications"

const { Text, Link } = Typography

const emailRegex =
	// eslint-disable-next-line no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

interface TForm {
	name: string
	email: string
	dob: string
	dni: string
	phoneNumber: string
	password: string
	password2: string
}

interface TLogin {
	token: string
	user: {
		id: number
		email: string
	}
}

export const Login = () => {
	const navigate = useNavigate()

	const [form] = Form.useForm<TForm>()

	const [mode, setMode] = useState<"login" | "register">("login")
	const [loading, setLoading] = useState(false)

	const { user, signin } = useAuth()

	const { successNotification, errorNotification } = useNotifications()

	if (user) {
		return <Navigate to="/" replace />
	}

	const onFinish = async (values: TForm) => {
		setLoading(true)

		if (mode === "register") {
			http("POST", "/auth/register", {
				params: { ...values, role: "patient" }
			})
				.then(() => {
					setMode("login")
					successNotification(
						"Por favor, inicie sesion para continuar",
						"Usuario creado exitosamente",
						"topRight"
					)
				})
				.catch((err) => {
					errorNotification("Error", "Datos inválidos", "topRight")
				})
				.finally(() => {
					setLoading(false)
				})
		}

		if (mode === "login") {
			http<TLogin>("POST", "/auth/login", {
				params: { ...values, role: "patient" }
			})
				.then(({ data }) => {
					signin(data.token, data.user, () => {
						navigate("/")
					})
				})
				.catch((err) => {
					console.error({ err })
					errorNotification("Error", "Datos inválidos", "topRight")
				})
				.finally(() => {
					setLoading(false)
				})
		}
	}

	const onFinishFailed = (errorInfo: any) => {
		console.error("Failed:", errorInfo)
	}

	return (
		<>
			<Layout.Content
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100%"
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "2em",
						padding: "2.5em",
						border: "0.5px solid lightgray",
						alignItems: "center",
						borderRadius: "10%"
					}}
				>
					<Image
						src="/img/sos-logo.png"
						alt="Salud Online Solidaria"
						preview={false}
					/>

					<Form
						form={form}
						style={{ width: "max(25vw, 300px)" }}
						layout="vertical"
						name="basic"
						initialValues={{ remember: true }}
						onFinish={onFinish}
						onFinishFailed={onFinishFailed}
						autoComplete="off"
					>
						{mode === "register" && (
							<Form.Item
								label="Nombre Completo"
								name="name"
								rules={[
									{
										required: true,
										message: "Por favor ingrese su nombre completo"
									}
								]}
							>
								<Input />
							</Form.Item>
						)}
						{mode === "register" && (
							<Form.Item
								label="DNI"
								name="dni"
								rules={[
									{
										required: true,
										message: "Por favor ingrese su número de documento"
									}
								]}
							>
								<Input type="number" />
							</Form.Item>
						)}
						{mode === "register" && (
							<Form.Item
								label="Fecha de Nacimiento"
								name="dob"
								rules={[
									{
										required: true,
										message: "Por favor ingrese su fecha de nacimiento"
									}
								]}
							>
								<Input type="date" />
							</Form.Item>
						)}
						{mode === "register" && (
							<Form.Item
								label="Número de Telefono"
								name="phoneNumber"
								rules={[
									{
										required: true,
										message: "Por favor ingrese su número de telefono"
									}
								]}
							>
								<Input type="number" />
							</Form.Item>
						)}
						<Form.Item
							label="Email"
							name="email"
							rules={[
								{
									required: true,
									message: "Ingrese un email válido",
									pattern: emailRegex
								}
							]}
						>
							<Input />
						</Form.Item>

						<Form.Item
							label="Contraseña"
							name="password"
							rules={[
								{ required: true, message: "Por favor ingrese su contraseña" }
							]}
						>
							<Input.Password />
						</Form.Item>

						{mode === "register" && (
							<Form.Item
								label="Repita su Contraseña"
								name="password2"
								rules={[
									{ required: true, message: "Por favor ingrese su contraseña" }
								]}
							>
								<Input.Password />
							</Form.Item>
						)}

						<Form.Item>
							<Button
								type="primary"
								shape="round"
								htmlType="submit"
								loading={loading}
								style={{ marginTop: "1em", height: "3em", width: "100%" }}
							>
								{mode === "login" ? "Iniciar Sesion" : "Registrarse"}
							</Button>
							<br />
							<br />
							{mode === "login" && (
								<>
									<Text>No tiene cuenta? </Text>
									<Link
										onClick={() => {
											setMode("register")
										}}
									>
										Registrese
									</Link>
								</>
							)}
							{mode === "register" && (
								<>
									<Link
										onClick={() => {
											setMode("login")
										}}
									>
										Volver a Iniciar Sesion
									</Link>
								</>
							)}
						</Form.Item>
					</Form>
				</div>
			</Layout.Content>
		</>
	)
}
