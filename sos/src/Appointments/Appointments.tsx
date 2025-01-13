import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import {
  Typography,
  Button,
  Space,
  Card,
  Row,
  Tag,
  Col,
  Popconfirm
} from "antd"
import { PlusOutlined, PhoneOutlined, DeleteOutlined } from "@ant-design/icons"
import moment from "moment"
import { Bubble } from "../components/Bubble"
import {
  changeAppointmentStatusById,
  deleteAppointment,
  getAppointmentsByProviderId
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

  useEffect(() => {
    getAppointmentsByProviderId(user.id)
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false))
  }, [user])

  const deleteHandler = async (appointment: Appointment) => {
    if (!appointment) return

    console.log("appointment", appointment)
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

  return (
    <Bubble>
      <div className="flex--space-between">
        <Title>Turnos</Title>
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

      {loading ? (
        <Loader />
      ) : appointments?.length ? (
        appointments.map((app) => (
          <Row key={app.id}>
            <Col style={{ width: "100%", marginBottom: "1em" }}>
              <Card
                style={{
                  borderColor: "#ddd",
                  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px"
                }}
                actions={[
                  <Popconfirm
                    placement="top"
                    title={"Está seguro que desea borrar este turno?"}
                    onConfirm={() => deleteHandler(app)}
                    okText="Si"
                    cancelText="No"
                  >
                    <Space
                      style={{ fontSize: "1.5em", color: "black" }}
                      size="middle"
                      direction="horizontal"
                    >
                      Borrar
                      <DeleteOutlined key="delete" />
                    </Space>
                  </Popconfirm>,
                  <Popconfirm
                    placement="top"
                    title={"Está seguro que desea realizar esta llamada?"}
                    onConfirm={() => {
                      infoNotification("Creando llamada")
                      changeAppointmentStatusById(app.id, "en_progreso")
                        .then(() => navigate(`/videocall/${app.id}`))
                        .catch(() => console.log("@TODO catchear el error"))
                    }}
                    okText="Si"
                    cancelText="No"
                    disabled={app.status === "terminado"}
                  >
                    <Space
                      style={{ fontSize: "1.5em", color: "green" }}
                      size="middle"
                      direction="horizontal"
                    >
                      Iniciar llamada
                      <PhoneOutlined key="call" />
                    </Space>
                  </Popconfirm>
                ]}
              >
                <div className="flex--space-between ">
                  <Meta
                    title={app.patient?.name}
                    description={
                      <div>
                        <Text>{app.patient?.phoneNumber}</Text>
                        <Text>{app.patient?.email}</Text>
                      </div>
                    }
                  />
                  <div className="flex--space-between">
                    <Tag style={{ fontSize: "1.2em" }} color="red">
                      {app.provider?.name}
                    </Tag>
                  </div>
                  <Tag style={{ fontSize: "1.2em" }} color="blue">
                    {`${moment(app.date).format("DD/MM/YYYY")} ${app.time}`}
                  </Tag>
                  <Tag
                    style={{ fontSize: "1em" }}
                    color={statusColorMapping[app.status]}
                  >
                    {app.status.toUpperCase()}
                  </Tag>
                </div>
              </Card>
            </Col>
          </Row>
        ))
      ) : (
        <Text>No hay turnos</Text>
      )}
    </Bubble>
  )
}
