import { useEffect, useState } from "react"
import { Typography, Empty } from "antd"
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
				setLoading(false)
			})
			.catch(console.error)
	}, [])

	if (loading) return <p>Loading...</p>

	return (
		<>
			<Title>Turnos</Title>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexWrap: "wrap",
					gap: "5em"
				}}
			>
				{appointments.length ? (
					appointments.map((appointment) => (
						<AppointmentCard
							key={appointment.id}
							appointment={appointment}
							setAppointments={setAppointments}
						/>
					))
				) : (
					<Empty description={<Text>No hay turnos</Text>}></Empty>
				)}
			</div>
		</>
	)
}
