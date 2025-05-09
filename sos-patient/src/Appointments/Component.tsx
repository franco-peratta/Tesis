import { useEffect, useState } from "react"
import { Typography, Empty, Row, Col, Spin } from "antd"
import { type Appointment } from "./model"
import { AppointmentCard } from "./AppointmentCard"
import { getAppointmentsByPatientId } from "./handler"
import { useAuth } from "../hooks/useAuth"

const { Title, Text } = Typography

export const Appointments = () => {
	const { user } = useAuth()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(false)

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
			<Title level={2} style={{ textAlign: "center" }}>Turnos</Title>
			<Row justify="center" style={{ gap: "2em" }}>
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
