import { Dispatch, SetStateAction } from "react"
import { Card, Popconfirm, Tag, Typography } from "antd"
import dayjs from "dayjs"
import 'dayjs/locale/es'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { CloseOutlined, MedicineBoxOutlined, PhoneOutlined } from "@ant-design/icons"
import { type Appointment } from "./model"
import { updateAppointmentStatus } from "./handler"
import { useNotifications } from "../hooks/useNotifications"

dayjs.extend(customParseFormat)

const { Text, Title } = Typography
const { Meta } = Card

interface Props {
	appointment: Appointment
	setAppointments: Dispatch<SetStateAction<Appointment[]>>
}

export const AppointmentCard = ({ appointment, setAppointments }: Props) => {
	const { id, status, date, time, provider } = appointment
	const { successNotification, errorNotification } = useNotifications()

	const handleCancelClick = async () => {
		try {
			await updateAppointmentStatus(appointment.id, "cancelado")
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

	const handleJoinClick = async () => {
		await updateAppointmentStatus(appointment.id, "en_progreso").then(console.log).catch(console.error)
		window.open(
			`https://meet.jit.si/${id}`,
			"_blank",
			"noopener,noreferrer"
		)
	}

	const datetime = dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm')
		.locale('es')
		.format('dddd D [de] MMMM [-] HH:mm')


	const Description = () => (
		<div>
			<Tag style={{ fontSize: "1em" }} color={statusColorMapping[status]}>
				{status.split("_").join(" ").toLocaleUpperCase()}
			</Tag>
			<br />
			<br />
			<div style={{ display: "flex", gap: "0.5em", paddingLeft: "0em" }}>
				<MedicineBoxOutlined />
				<Title level={5} style={{ margin: 0 }}>Dr/a {provider?.name}</Title>
			</div>
		</div>
	)

	const actions = [
		<Popconfirm
			placement="top"
			title={"Cancelar turno?"}
			onConfirm={handleCancelClick}
			okText="Si"
			cancelText="No"
		>
			<CloseOutlined key="cancel" />
		</Popconfirm>,
		<Popconfirm
			placement="top"
			title={"Iniciar llamada?"}
			onConfirm={handleJoinClick}
			okText="Si"
			cancelText="No"
		>
			<PhoneOutlined key="call" />
		</Popconfirm>,
	]

	return (
		<Card key={id} style={{ width: "100%" }} actions={actions}>
			<Meta
				title={datetime.charAt(0).toUpperCase() + datetime.slice(1)}
				description={<Description />}
			/>
		</Card>
	)
}

export const statusColorMapping = {
	espera: "blue",
	en_progreso: "yellow",
	terminado: "green",
	cancelado: "red"
}


// return (
// 	<Card title={`Turno #${id}`} style={{ border: "1px solid #ccc" }}>
// 		<Paragraph>Estado: {formatStatusName(status)}</Paragraph>
// 		<Paragraph>Fecha: {date}</Paragraph>
// 		<Paragraph>Hora: {time}</Paragraph>
// 		<Paragraph>Médico: {provider.name}</Paragraph>
// 		<Button
// 			type="primary"
// 			onClick={handleJoinClick}
// 			style={{ marginRight: 8 }}
// 			disabled={status === "cancelado"}
// 		>
// 			Unirse
// 		</Button>
// 		<Button
// 			onClick={handleCancelClick}
// 			disabled={status === "cancelado" || status === "terminado"}
// 		>
// 			Cancelar
// 		</Button>
// 	</Card>
// )