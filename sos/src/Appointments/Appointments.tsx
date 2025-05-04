import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Link } from "react-router-dom"
import {
  Typography,
  Button,
  Space,
  Card,
  Row,
  Tag,
  Col,
  Popconfirm,
  DatePicker,
  Empty
} from "antd"
import { PlusOutlined, PhoneOutlined, DeleteOutlined, IdcardOutlined, CalendarOutlined, FilterOutlined } from "@ant-design/icons"
import moment, { Moment } from "moment"
import "moment/locale/es"; // Import Spanish locale
import { Bubble } from "../components/Bubble"
import {
  changeAppointmentStatusById,
  deleteAppointment,
  getUpcomingAppointmentsByProviderId
} from "./Handler"
import { Loader } from "../components/Loader"
import { infoNotification } from "../Notification"
import { Appointment, statusColorMapping } from "./model"
import { useAuth } from "../Auth/useAuth"

const { Title, Text } = Typography
const { Meta } = Card

export const Appointments = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>()
  const [fromDate, setFromDate] = useState<Moment | null>(null)
  const [toDate, setToDate] = useState<Moment | null>(null)

  useEffect(() => {
    getUpcomingAppointmentsByProviderId(user.id)
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false))
  }, [user])

  const deleteHandler = async (appointment: Appointment) => {
    if (!appointment) return
    try {
      await deleteAppointment(appointment.id)
      setAppointments((prev) =>
        prev?.filter((app) => app.id !== appointment.id)
      )
    } catch (e) {
      console.error("Error: ", e)
    }
  }

  if (loading) return <Loader />
  if (!appointments) return <Loader />

  const filteredAppointments = appointments.filter((app) => {
    const appDate = moment(app.date)
    if (fromDate && appDate.isBefore(fromDate, "day")) return false
    if (toDate && appDate.isAfter(toDate, "day")) return false
    return true
  })

  return (
    <Bubble>
      <div className="flex--space-between">
        <Title>Turnos próximos</Title>
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

      <Space style={{ marginBottom: 16 }}>
        <FilterOutlined style={{ marginRight: 4 }} />
        <DatePicker
          placeholder="Desde"
          value={fromDate}
          onChange={(date) => setFromDate(date)}
        />
        <DatePicker
          placeholder="Hasta"
          value={toDate}
          onChange={(date) => setToDate(date)}
        />
      </Space>

      {filteredAppointments.length ? (
        filteredAppointments.reduce((rows: JSX.Element[], _, index) => {
          if (index % 2 !== 0) return rows

          const chunk = filteredAppointments.slice(index, index + 2)

          rows.push(
            <Row gutter={[16, 16]} style={{ marginBottom: "16px" }} key={index}>
              {chunk.map((app) => (
                <Col span={12} key={app.id}>
                  <Card
                    style={{
                      borderColor: "#f0f0f0",
                      borderRadius: 10,
                      boxShadow: "rgba(0, 0, 0, 0.05) 0px 4px 12px",
                      padding: "12px",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {/* Patient Info */}
                      <div>
                        <Title level={3}>
                          <Link to={`/pacientes/${app.patient?.id}`}>
                            {app.patient?.name}
                          </Link>
                        </Title>
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                          <PhoneOutlined style={{ marginRight: 4 }} />
                          {app.patient?.phoneNumber}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                          <IdcardOutlined style={{ marginRight: 4 }} />
                          {app.patient?.dni}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '18px' }}>
                          <CalendarOutlined style={{ marginRight: 4 }} />
                          {moment(`${app.date} ${app.time}`, "YYYY-MM-DD HH:mm").format("D [de] MMMM [de] YYYY [a las] h:mm A")}
                        </Text>
                      </div>

                      {/* Date and Provider */}
                      {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Tag color="blue" style={{ fontSize: "0.95em", padding: "4px 8px" }}>
                          {moment(`${app.date} ${app.time}`, "YYYY-MM-DD HH:mm").format("D [de] MMMM [de] YYYY [a las] h:mm A")}
                        </Tag>
                        <Tag color="red" style={{ fontSize: "0.95em", padding: "4px 8px" }}>
                          Dr/a {app.provider?.name}
                        </Tag>
                      </div> */}

                      {/* Status */}
                      <Tag
                        color={statusColorMapping[app.status]}
                        style={{
                          alignSelf: "flex-start",
                          fontWeight: 500,
                          fontSize: "1.2em",
                          padding: "6px 12px",
                          borderRadius: "6px",
                        }}
                      >
                        {app.status.toUpperCase()}
                      </Tag>

                      {/* Action buttons */}
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "8px" }}>
                        <Popconfirm
                          placement="top"
                          title="¿Está seguro que desea borrar este turno?"
                          onConfirm={() => deleteHandler(app)}
                          okText="Sí"
                          cancelText="No"
                        >
                          <Button type="default" danger icon={<DeleteOutlined />}>
                            Borrar
                          </Button>
                        </Popconfirm>

                        <Popconfirm
                          placement="top"
                          title="¿Está seguro que desea realizar esta llamada?"
                          onConfirm={() => {
                            infoNotification("Creando llamada")
                            changeAppointmentStatusById(app.id, "en_progreso")
                              .then(() => navigate(`/videocall/${app.id}`))
                              .catch(() => console.error("@TODO catchear el error"))
                          }}
                          okText="Sí"
                          cancelText="No"
                          disabled={app.status === "terminado"}
                        >
                          <Button type="primary" icon={<PhoneOutlined />} disabled={app.status === "terminado"}>
                            Iniciar llamada
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}

            </Row>
          )

          return rows
        }, [])
      ) :
        <div style={{
          width: '100%',
          height: '300px', // or any height you want, e.g. '100vh' for full screen
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Empty description={<Text>El paciente no tiene turnos para los filtros seleccionados</Text>} />
        </div>
      }
    </Bubble>
  )
}
