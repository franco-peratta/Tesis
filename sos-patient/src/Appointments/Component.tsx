import { useEffect, useState } from "react"
import { Typography, Empty, Row, Col, Spin, Button, Space } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import { type Appointment } from "./model"
import { AppointmentCard } from "./AppointmentCard"
import { getAppointmentsByPatientId } from "./handler"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"

const { Title, Text } = Typography

export const Appointments = () => {
	const { user } = useAuth()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(false)

	const navigate = useNavigate()

	useEffect(() => {
		setLoading(true)
		getAppointmentsByPatientId(user.id)
			.then((res) => {
				setAppointments(res.data)
			})
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	if (loading) return <Spin size="large" style={{ display: "block", margin: "2em auto" }} />

	return (
		<>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "1em 0", padding: "1em" }}>
				<Title level={2} style={{ margin: 0 }}>Turnos</Title>
				<Button
					onClick={() => navigate("/turnos/nuevo")}
					type="default"
					size="large"
				>
					<Space direction="horizontal">
						<PlusOutlined />
						Crear turno
					</Space>
				</Button>
			</div>
			<Row justify="center" style={{ gap: "2em", marginBottom: "2em" }}>
				{appointments.length ? (
					appointments.map((appointment) => (
						<Col
							key={appointment.id}
							xs={22}
							sm={16}
							md={12}
							lg={8}
							xl={6}
						>
							<AppointmentCard
								appointment={appointment}
								setAppointments={setAppointments}
							/>
						</Col>
					))
				) : (
					<Empty description={<Text>No hay turnos</Text>} style={{ marginTop: 50 }} />
				)}
			</Row>
		</>
	)
}
