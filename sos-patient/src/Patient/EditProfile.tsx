import React, { useEffect, useState } from "react"
import { Form, Input, Button, DatePicker, Card } from "antd"
import {
	UserOutlined,
	MailOutlined,
	IdcardOutlined,
	PhoneOutlined
} from "@ant-design/icons"
import { useAuth } from "../hooks/useAuth"
import { getPatientById, updatePatient } from "./handler"
import dayjs, { Dayjs } from "dayjs"
import { Patient } from "./model"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../hooks/useNotifications"

interface ProfileFormData {
	name: string
	email: string
	dni: string
	phoneNumber: string
	dob: Dayjs
}

export const EditProfile = () => {
	const { user } = useAuth()
	const [form] = Form.useForm<ProfileFormData>()
	const [patient, setPatient] = useState<Patient>()
	const [errors, _setErrors] = useState<Record<string, string>>({})
	const navigate = useNavigate()
	const { successNotification, errorNotification } = useNotifications()

	useEffect(() => {
		if (user) {
			getPatientById(user.id).then(({ data }) => {
				setPatient(data)
				form.setFieldsValue({
					name: data.name,
					email: user.email,
					dni: data.dni,
					phoneNumber: data.phoneNumber ?? "",
					dob: dayjs(data.dob)
				})
			})
		}
	}, [form, user])

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const newPatient = {
				...patient,
				...values,
				dob: values.dob.format("YYYY-MM-DD")
			} as Patient
			await updatePatient(newPatient)
			successNotification("Exito", "Se ha actualizado el perfil correctamente")
			navigate("/profile")
		} catch (err) {
			console.log(err)
			errorNotification("Error", "No se ha podido actualizar el perfil")
		}
	}

	return (
		<Card
			style={{
				width: "auto",
				margin: "2em 0",
				boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
				backgroundColor: "white",
				fontFamily: "Arial, sans-serif",
				fontSize: "20px"
			}}
			title={patient?.name}
		>
			<Form form={form} layout="vertical" onFinish={handleSubmit}>
				<Form.Item
					label="Email"
					name="email"
					rules={[
						{ required: true, message: "Please enter your email" },
						{ type: "email", message: "Please enter a valid email" }
					]}
					validateStatus={errors.email ? "error" : undefined}
					help={errors.email}
				>
					<Input
						disabled
						prefix={<MailOutlined />}
						placeholder="Enter your email"
					/>
				</Form.Item>
				<Form.Item
					label="Name"
					name="name"
					rules={[{ required: true, message: "Please enter your name" }]}
					validateStatus={errors.name ? "error" : undefined}
					help={errors.name}
				>
					<Input prefix={<UserOutlined />} placeholder="Enter your name" />
				</Form.Item>

				<Form.Item
					label="DNI"
					name="dni"
					rules={[
						{ required: true, message: "Please enter your dni" },
						{ min: 5, message: "Please enter a valid dni" }
					]}
					validateStatus={errors.dni ? "error" : undefined}
					help={errors.dni}
				>
					<Input prefix={<IdcardOutlined />} placeholder="Enter your dni" />
				</Form.Item>
				<Form.Item
					label="Número de telefono"
					name="phoneNumber"
					rules={[
						{ required: false, message: "Please enter your phone number" },
						{ min: 5, message: "Please enter a valid phone number" }
					]}
					validateStatus={errors.phoneNumber ? "error" : undefined}
					help={errors.phoneNumber}
				>
					<Input
						prefix={<PhoneOutlined />}
						placeholder="Enter your phone number"
					/>
				</Form.Item>
				<Form.Item
					label="Fecha de nacimiento"
					name="dob"
					rules={[
						{ required: true, message: "Please enter your date of birth" }
					]}
					validateStatus={errors.dob ? "error" : undefined}
					help={errors.dob}
				>
					<DatePicker
						onChange={(a, b) => {
							console.log(a, b)
						}}
					/>
				</Form.Item>
				<Form.Item>
					<div style={{ display: "flex", gap: "1em" }}>
						<Button
							type="default"
							size="large"
							onClick={() => navigate("/profile")}
						>
							Cancelar
						</Button>
						<Button type="primary" htmlType="submit" size="large">
							Guardar
						</Button>
					</div>
				</Form.Item>
			</Form>
		</Card>
	)
}
