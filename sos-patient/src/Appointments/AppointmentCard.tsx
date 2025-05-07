import { Button, Card, Typography } from "antd"
import { type Appointment } from "./model"
import { updateAppointmentStatus } from "./handler"
import { useNotifications } from "../hooks/useNotifications"
import { Dispatch, SetStateAction } from "react"
import { formatStatusName } from "./utils"

const { Paragraph } = Typography

interface Props {
	appointment: Appointment
	setAppointments: Dispatch<SetStateAction<Appointment[]>>
}
export const AppointmentCard = ({ appointment, setAppointments }: Props) => {
	const { id, status, date, time, provider } = appointment

	const { successNotification, errorNotification } = useNotifications()

	const handleCancelClick = async () => {
		try {
			await updateAppointmentStatus(appointment, "cancelado")
			setAppointments((prev) => {
				const newStatus = [...prev]
				const i = prev.findIndex((appointment) => appointment.id === id)
				newStatus[i].status = "cancelado"
				return newStatus
			})
			successNotification(
				"Turno cancelado",
				"Se ha cancelado el turno correctamente",
				"topRight"
			)
		} catch (error) {
			errorNotification(
				"Error",
				"Ha ocurrido un error al cancelar el turno",
				"topRight"
			)
		}
	}

	const handleJoinClick = () => {
		updateAppointmentStatus(appointment).then(console.log).catch(console.error)

		const url = btoa(`appointment=${id}`)
		window.open(
			`https://meet.jit.si/${url}`,
			"_blank",
			"noopener,noreferrer"
		)
	}

	return (
		<Card title={`Turno #${id}`} style={{ border: "1px solid #ccc" }}>
			<Paragraph>Estado: {formatStatusName(status)}</Paragraph>
			<Paragraph>Fecha: {date}</Paragraph>
			<Paragraph>Hora: {time}</Paragraph>
			<Paragraph>Médico: {provider.name}</Paragraph>
			<Button
				type="primary"
				onClick={handleJoinClick}
				style={{ marginRight: 8 }}
				disabled={status === "cancelado"}
			>
				Unirse
			</Button>
			<Button
				onClick={handleCancelClick}
				disabled={status === "cancelado" || status === "terminado"}
			>
				Cancelar
			</Button>
		</Card>
	)
}
