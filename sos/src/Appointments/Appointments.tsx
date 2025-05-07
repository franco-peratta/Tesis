import { useEffect, useRef, useState } from "react"
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
  Empty,
  Calendar,
  Segmented
} from "antd"
import {
  PlusOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  FilterOutlined,
  MedicineBoxOutlined,
  CheckOutlined
} from "@ant-design/icons"
import moment, { Moment } from "moment"
import "moment/locale/es"
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

export const Appointments = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>()
  const [fromDate, setFromDate] = useState<Moment | null>(null)
  const [toDate, setToDate] = useState<Moment | null>(null)
  const [view, setView] = useState<"list" | "calendar">("list")
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const lastPanelChange = useRef<number>(0);

  useEffect(() => {
    const checkMobile = () => setIsSmallScreen(window.innerWidth <= 1280)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [setIsSmallScreen])

  useEffect(() => {
    getUpcomingAppointmentsByProviderId(user.id)
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <Loader />
  if (!appointments) return <Loader />

  const filteredAppointments = appointments.filter((app) => {
    const appDate = moment(app.date)
    if (view === "list" && fromDate && appDate.isBefore(fromDate, "day")) return false
    if (view === "list" && toDate && appDate.isAfter(toDate, "day")) return false
    return true
  })

  const dateCellRender = (value: Moment) => {
    const dailyAppointments = filteredAppointments.filter((app) =>
      moment(app.date).isSame(value, "day")
    )

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {dailyAppointments.map((app) => (
          <li key={app.id}>
            <Tag color={statusColorMapping[app.status]}>
              {app.patient?.name}
            </Tag>
          </li>
        ))}
      </ul>
    )
  }

  const handlePanelChange = () => {
    lastPanelChange.current = Date.now(); // Store timestamp of panel change
  };

  const handleSelect = (value: moment.Moment) => {
    const now = Date.now();
    // Only log if more than 300ms passed since last panel change
    if (now - lastPanelChange.current > 300) {
      // console.log("Day clicked:", value);
      setFromDate(value.startOf("day"))
      setToDate(value.endOf("day"))
      setView("list")
    }
  };

  return (
    <Bubble>
      <div className="flex--space-between" style={{ marginBottom: 16 }}>
        <Title>Turnos próximos</Title>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Segmented
            options={[
              { label: "Lista", value: "list" },
              { label: "Calendario", value: "calendar" },
            ]}
            value={view}
            onChange={(val) => setView(val as "list" | "calendar")}
          />
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
      </div>

      <Space style={{ marginBottom: 16 }}>
        <FilterOutlined style={{ marginRight: 4 }} />
        <DatePicker
          placeholder="Desde"
          value={fromDate}
          onChange={(date) => setFromDate(date)}
          disabled={view === "calendar"}
        />
        <DatePicker
          placeholder="Hasta"
          value={toDate}
          onChange={(date) => setToDate(date)}
          disabled={view === "calendar"}
        />
        <Button
          onClick={() => {
            setFromDate(null)
            setToDate(null)
          }}
          disabled={view === "calendar"}
        >
          Limpiar filtros
        </Button>
      </Space>

      {view === "list" ? (
        filteredAppointments.length ? (
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
                        <div>
                          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <Title level={3}>
                              <Link to={`/pacientes/${app.patient?.id}`}>
                                {app.patient?.name}
                              </Link>
                            </Title>
                            <Tag
                              color="blue"
                              style={{
                                alignSelf: "flex-start",
                                fontWeight: 500,
                                fontSize: "1.2em",
                                padding: "6px 12px",
                                borderRadius: "6px",
                              }}
                            >
                              <MedicineBoxOutlined style={{ marginRight: 4 }} />
                              {app.provider?.name}
                            </Tag>
                          </div>
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
                          <br />
                        </div>

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
                          {app.status.split("_").join(" ").toLocaleUpperCase()}
                        </Tag>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "8px" }}>
                          <Popconfirm
                            placement="top"
                            title="¿Está seguro que desea marcar el turno como completado?"
                            onConfirm={() => {
                              changeAppointmentStatusById(app.id, "terminado")
                                .then(() => {
                                  infoNotification("Turno marcado como finalizado")
                                  getUpcomingAppointmentsByProviderId(user.id)
                                    .then(({ data }) => setAppointments(data))
                                    .finally(() => setLoading(false))
                                })

                                .catch(() => console.error("Error al actualizar el turno"))
                            }}
                            okText="Sí"
                            cancelText="No"
                          >
                            <Button type="default" icon={<CheckOutlined />}>
                              Finalizar
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
        ) : (
          <div style={{
            width: '100%',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Empty description={<Text>El paciente no tiene turnos para los filtros seleccionados</Text>} />
          </div>
        )
      ) : (
        <div style={{ maxWidth: "100%", overflowX: "auto" }}>
          <Calendar
            dateCellRender={dateCellRender}
            fullscreen={!isSmallScreen}
            mode="month"
            disabledDate={(current) => current && current.year() < 2025}
            onSelect={handleSelect}
            onPanelChange={handlePanelChange}
          />
        </div>
      )}
    </Bubble >
  )
}
