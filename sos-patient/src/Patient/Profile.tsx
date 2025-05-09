import { useNavigate } from "react-router-dom"
import { Card, Avatar, Typography, Button } from "antd"
import { UserOutlined, EditOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { getPatientById } from "./handler"
import { Patient } from "./model"

const { Title, Paragraph } = Typography

export const Profile = () => {
	const { user } = useAuth()
	const navigate = useNavigate()
	const [patient, setPatient] = useState<Patient | null>(null)

	useEffect(() => {
		if (user)
			getPatientById(user.id)
				.then(({ data }) => setPatient(data))
				.catch((err) => console.log(err))
	}, [user])

	if (!user) return <div>Loading...</div>
	if (!patient) return <div>Oops...</div>

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "2em"
			}}
		>
			<Card
				style={{
					width: "auto",
					borderRadius: "10px",
					boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
					backgroundColor: "white",
					fontFamily: "Arial, sans-serif",
					fontSize: "20px"
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "80px",
						backgroundColor: "lightgray",
						borderRadius: "10px 10px 0 0"
					}}
				>
					<Avatar icon={<UserOutlined />} size={64} />
				</div>
				<div style={{ padding: "20px" }}>
					<Paragraph style={{ fontWeight: "bold", fontSize: "2em" }}>
						{patient.name}
					</Paragraph>
					<Paragraph style={{ fontSize: "1em" }}>
						<strong>DNI:</strong> {patient.dni}
					</Paragraph>
					<Paragraph style={{ fontSize: "1em" }}>
						<strong>Email:</strong> {user.email}
					</Paragraph>
					<Paragraph style={{ fontSize: "1em" }}>
						<strong>Phone:</strong> {patient.phoneNumber}
					</Paragraph>
					<Paragraph style={{ fontSize: "1em" }}>
						<strong>Fecha de nacimiento:</strong> {patient.dob}
					</Paragraph>
				</div>
			</Card>
			<Button
				style={{ fontSize: "1.5em", width: "auto", height: "auto" }}
				type="primary"
				icon={<EditOutlined />}
				onClick={() => {
					navigate("/profile/edit")
				}}
			>
				Editar
			</Button>
		</div>
	)
}
