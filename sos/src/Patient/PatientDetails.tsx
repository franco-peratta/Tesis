import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Card, Popconfirm, Space, Tabs, Tag, Typography, Checkbox, Empty } from "antd"
import {
  CloseOutlined,
  DeleteOutlined,
  PhoneOutlined,
  CheckOutlined,
  PlusOutlined
} from "@ant-design/icons"
import { PatientWithAppointments } from "./model"
import { statusColorMapping } from "../Appointments/model"
import { Bubble } from "../components/Bubble"
import { Loader } from "../components/Loader"
import { getPatientByIdWithAppointments } from "./Handler"
import { toPatients } from "./routes"
import { errorNotification, successNotification } from "../Notification"
import { updateEMR } from "../EMR/Handler"
import "./styles.less"
import {
  changeAppointmentStatusById,
  deleteAppointment
} from "../Appointments/Handler"
import { EMR } from "../EMR"

const { Title, Text } = Typography
const { TabPane } = Tabs
const { Meta } = Card

export const PatientDetails = () => {
  const { id } = useParams()

  const [patient, setPatient] = useState<PatientWithAppointments>()
  const [loading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (id)
      getPatientByIdWithAppointments(id)
        .then((res) => {
          setPatient(res.data)
        })
        .finally(() => setIsLoading(false))
  }, [id])

  if (loading) return <Loader />

  if (!patient) {
    errorNotification("Error inesperado")
    return <span>Error Page goes here - Patient not found</span>
  }

  const changeEmr = (emr: string) => {
    updateEMR(patient.id, emr)
      .then((res) => {
        const newEmr = res.data.emr
        setPatient({ ...patient, emr: newEmr })
        successNotification("Historia clinica actualizada con exito")
      })
      .catch((e) => {
        errorNotification("Error al actualizar la historia clinica")
        console.error(e)
      })
  }

  return (
    <Bubble>
      <div className="flex--space-between">
        <Title>{patient.name}</Title>
        <CloseOutlined
          style={{ fontSize: "1.5em" }}
          onClick={() => {
            navigate(toPatients())
          }}
        />
      </div>
      <div className="card-container">
        <Tabs defaultActiveKey="1" type="card" size="large">
          <TabPane tab="Detalles" key="1">
            <Details patient={patient} setPatient={setPatient} />
          </TabPane>
          <TabPane tab="Historia Clinica" key="2">
            <div className="flex--columns">
              <EMR
                initialMarkdown={patient.emr}
                onSave={(markdown: string) => changeEmr(markdown)}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Bubble>
  )
}

const statusOptions = ["espera", "en_progreso", "terminado"] as const
type StatusType = typeof statusOptions[number]

const Details = ({
  patient,
  setPatient
}: {
  patient: PatientWithAppointments
  setPatient: Dispatch<SetStateAction<PatientWithAppointments | undefined>>
}) => {
  const navigate = useNavigate()
  const [selectedStatuses, setSelectedStatuses] = useState<StatusType[]>([
    "espera",
    "en_progreso"
  ])

  const toggleStatus = (status: StatusType) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const deleteHandler = async (appointment: any) => {
    const { id } = appointment
    try {
      await deleteAppointment(id)
      const newPatient = { ...patient }
      newPatient.Appointment = patient.Appointment?.filter(
        (app) => app.id !== id
      )
      setPatient(newPatient)
      successNotification("Turno borrado con exito")
    } catch (e) {
      errorNotification("Error al borrar el turno")
      console.error(e)
    }
  }

  const appointmentsToShow = patient.Appointment?.filter((app) =>
    selectedStatuses.includes(app.status as StatusType)
  ) ?? []

  return (
    <>
      <div className="flex--space-between">
        <Title>Turnos</Title>
        <Button
          onClick={() => navigate(`/turnos/nuevo?patient=${patient.id}`)}
          type="default"
          size="large"
        >
          <Space direction="horizontal">
            <PlusOutlined />
            Crear turno
          </Space>
        </Button>
      </div>

      {/* Filters */}
      <div style={{ margin: "1em 0", display: "flex", gap: "0.5em" }}>
        {statusOptions.map((status) => (
          <Button
            key={status}
            type={selectedStatuses.includes(status) ? "primary" : "default"}
            onClick={() => toggleStatus(status)}
          >
            {status.split("_").join(" ").toLocaleUpperCase()}
          </Button>
        ))}
      </div>

      {/* Appointments */}
      <div className="row" style={{ display: "flex", gap: "1em", flexWrap: "wrap" }}>
        {appointmentsToShow.length > 0 ? (
          appointmentsToShow.map((app) => {
            const Description = () => (
              <div>
                <Tag style={{ fontSize: "1em" }} color={statusColorMapping[app.status]}>
                  {app.status.split("_").join(" ").toLocaleUpperCase()}
                </Tag>
                <br />
                <br />
                Dr/a: {app.provider?.name}
              </div>
            )

            const actions = [
              <Popconfirm
                placement="top"
                title={"Está seguro que desea borrar este turno?"}
                onConfirm={() => deleteHandler({ ...app, patientId: patient.id })}
                okText="Si"
                cancelText="No"
              >
                <DeleteOutlined key="delete" />
              </Popconfirm>,
              <Popconfirm
                placement="top"
                title={"Finalizar llamada?"}
                onConfirm={async () => {
                  try {
                    await changeAppointmentStatusById(app.id, "terminado")
                    navigate(0)
                  } catch (err) {
                    console.error(err)
                  }
                }}
                okText="Si"
                cancelText="No"
              >
                <CheckOutlined key="check" disabled={app.status === "terminado"} />
              </Popconfirm>,
              <Popconfirm
                placement="top"
                title={"Iniciar llamada?"}
                onConfirm={() => {
                  changeAppointmentStatusById(app.id, "en_progreso")
                    .then(() => navigate(`/videocall/${app.id}`))
                    .catch((e) => { errorNotification("Error al crear la llamada"); console.error(e) })

                }}
                okText="Si"
                cancelText="No"
              >
                <PhoneOutlined key="call" disabled={app.status === "terminado"} />
              </Popconfirm>
            ]

            return (
              <Card key={app.id} style={{ width: 300 }} actions={actions}>
                <Meta
                  title={`${app.date.split("T")[0]} ${app.time}`}
                  description={<Description />}
                />
              </Card>
            )
          })
        ) : (
          <div style={{
            width: '100%',
            height: '300px', // or any height you want, e.g. '100vh' for full screen
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Empty description={<Text>El paciente no tiene turnos para los filtros seleccionados</Text>} />
          </div>
        )}
      </div>
    </>
  )
}
