import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import moment, { Moment } from "moment"
import {
  Form,
  Typography,
  DatePicker,
  TimePicker,
  Row,
  Space,
  Button,
  Select,
  Steps,
  InputNumber
} from "antd"
import { CloseOutlined } from "@ant-design/icons"
import { Bubble } from "../components/Bubble"
import { Patient } from "../Patient/model"
import { getPatients } from "../Patient/Handler"
import { addAppointment, getOccupiedSlots, getProvidersList } from "./Handler"
import { Provider, Shifts } from "../Profile/Model"
import { errorNotification, successNotification } from "../Notification"
import { Status } from "./model"
import { useAuth } from "../Auth/useAuth"

const { Option } = Select
const { Title, Text } = Typography
const { Step } = Steps

const steps = ["Elegir paciente", "Elegir fecha", "Validar datos"]

export const NewAppointment = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patient');

  const { user } = useAuth()

  const [idForm] = Form.useForm()
  const [detailsForm] = Form.useForm()

  const [current, setCurrent] = useState(0)
  const [medics, setMedics] = useState<Provider[]>()
  const [patients, setPatients] = useState<Patient[]>()
  const [isLoading, setIsLoading] = useState(true)
  const [disabledTime, setDisabledTime] = useState<any>()

  useEffect(() => {
    // Fetch patients and providers
    Promise.all([getPatients(), getProvidersList()])
      .then(([{ data: patients }, { data: medics }]) => {
        setPatients(patients)
        setMedics(medics)
        setIsLoading(false)

        // Check if the query param 'patient' exists and set the value in the form
        if (patientId && patients?.length) {
          const selected_patient = patients.find(p => {
            return p.id === parseInt(patientId)
          })
          console.log({ patientId })
          selected_patient && idForm.setFieldsValue({
            patient: selected_patient.id,
          })
        }
      })
      .catch(() => {
        errorNotification("Error al cargar los datos")
      })
  }, [idForm, patientId])

  const next = useCallback(() => {
    if (current === 0) {
      idForm
        .validateFields()
        .then(() => setCurrent((current) => current + 1))
        .catch(() => { })
    }
    if (current === 1) {
      detailsForm
        .validateFields()
        .then(() => setCurrent((current) => current + 1))
        .catch((e) => {
          console.error(e)
        })
    }
  }, [idForm, detailsForm, current])

  const prev = () => {
    setCurrent((prev) => prev - 1)
  }

  const getNewAppointmentSummary = () => {
    const patientId = idForm.getFieldsValue().patient
    const providerId = detailsForm.getFieldsValue().medic || user.id

    const patient = patients?.find((p) => p.id === patientId)
    const provider = medics?.find((p) => p.id === providerId)

    if (patient && provider) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
            width: "100%",
            flexWrap: "wrap",
            gap: "3em 1em"
          }}
        >
          <div style={{ minWidth: "300px" }}>
            <Title level={4}>Especialista</Title>
            <Text>{provider.name}</Text>
          </div>
          <div style={{ minWidth: "300px" }}>
            <Title level={4}>Paciente</Title>
            <Text>{patient.name}</Text>
          </div>
          <div style={{ minWidth: "300px" }}>
            <Title level={4}>Fecha</Title>
            <Text>
              {detailsForm.getFieldsValue().date.format("DD/MM/YYYY")}
            </Text>
          </div>
          <div style={{ minWidth: "300px" }}>
            <Title level={4}>Hora</Title>
            <Text>{detailsForm.getFieldsValue().time.format("HH:mm")}</Text>
          </div>
        </div>
      )
    }
    return <>Aca paso algo che</>
  }

  const disabledDates = (current: Moment) => {
    const disablePreviousDates = current && current < moment().startOf("day")

    const id = detailsForm.getFieldValue("medic") || user.id
    const selectedMedic = medics?.find((m) => m.id === id)

    if (!selectedMedic) return disablePreviousDates

    const shifts = JSON.parse(selectedMedic.shifts) as Shifts
    const daysOff = []
    !shifts.monday.available && daysOff.push(1)
    !shifts.tuesday.available && daysOff.push(2)
    !shifts.wednesday.available && daysOff.push(3)
    !shifts.thursday.available && daysOff.push(4)
    !shifts.friday.available && daysOff.push(5)
    !shifts.saturday.available && daysOff.push(6)
    !shifts.sunday.available && daysOff.push(0)

    const disableDaysOff = daysOff.includes(current.day())

    return disablePreviousDates || disableDaysOff
  }

  const getAvailableHours = async (date: Moment | null) => {
    if (!date) {
      setDisabledTime(undefined)
      return
    }

    const id = detailsForm.getFieldValue("medic") || user.id
    const selectedMedic = medics?.find((m) => m.id === id)

    if (!selectedMedic) return

    const availableHours: number[] = []
    const shifts = (JSON.parse(selectedMedic.shifts) as Shifts)
    const day = date
      .locale('en')
      .format("dddd")
      .toLowerCase() as keyof typeof shifts

    for (const interval of shifts[day].shifts) {
      for (let i = interval.from; i < interval.to; i++) {
        availableHours.push(i)
      }
    }

    const unavailableHours: number[] = []

    for (let i = 0; i < 24; i++) {
      if (!availableHours.includes(i)) {
        unavailableHours.push(i)
      }
    }

    const { data: occupiedSlots } = await getOccupiedSlots(user.id, date)

    const hours = new Set()
    for (const slot of occupiedSlots) {
      const hour = slot.split(":")[0]
      hours.add(hour)
    }

    setDisabledTime(() => {
      return () => {
        return {
          disabledHours: () => {
            return unavailableHours
          },
          disabledMinutes: (hour: number) => {
            if (hours.has(hour.toString())) {
              const minutes = new Set()
              for (const slot of occupiedSlots) {
                const [hour, minute] = slot.split(":")
                if (hour === hour.toString()) {
                  minutes.add(Number(minute))
                }
              }
              return Array.from(minutes)
            }
            return []
          }
        }
      }
    })
  }

  const onMedicChange = (value: string) => {
    detailsForm.setFieldsValue({ medic: value, date: undefined })
  }

  const submit = async () => {
    setIsLoading(true)
    const patientId = parseInt(idForm.getFieldsValue().patient)
    const {
      medic: providerId,
      date,
      time,
      duration
    } = detailsForm.getFieldsValue()
    const appointment = {
      status: Status.espera,
      date,
      time,
      duration,
      providerId,
      patientId
    }

    try {
      const appDto = {
        ...appointment,
        providerId: appointment.providerId || user.id,
        date: appointment.date.format("YYYY-MM-DD"),
        time: appointment.time.format("HH:mm")
      }
      const data = await addAppointment(appDto)
      successNotification("Turno creado correctamente")
      navigate("/turnos")
    } catch (e) {
      errorNotification("Error al crear el turno")
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Bubble>
      <div className="flex--space-between">
        <Title>Nuevo turno</Title>
        <CloseOutlined
          style={{ fontSize: "1.5em" }}
          onClick={() => {
            navigate("/turnos")
          }}
        />
      </div>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item} title={item} />
        ))}
      </Steps>
      <div style={stepsStyle}>
        <div style={formStyle}>
          <Form
            form={idForm}
            name="patient-authentication"
            layout="vertical"
            onFinish={next}
            style={{ display: current === 0 ? "inherit" : "none" }}
          >
            <Form.Item
              name="patient"
              label="Paciente"
              rules={[
                {
                  required: true,
                  message: "Por favor, elija un paciente"
                }
              ]}
            >
              <Select
                showSearch
                size="large"
                style={{ width: 200 }}
                placeholder="Paciente"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (option && option.children) {
                    return (
                      option.children
                        .toString()
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    )
                  }
                  return false
                }}
                loading={!patients}
              >
                {patients &&
                  patients.map((p, index) => (
                    <Option key={`patient${index}`} value={p.id}>
                      {p.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Form>

          <Form
            form={detailsForm}
            layout="vertical"
            name="details"
            style={{ display: current === 1 ? "inherit" : "none" }}
          >
            <Form.Item
              name="medic"
              label="Especialista"
              rules={[
                {
                  required: false
                }
              ]}
            >
              <Select
                showSearch
                size="large"
                style={{ width: 200 }}
                defaultValue={user?.id}
                disabled={!!user}
                placeholder="Especialista"
                optionFilterProp="children"
                filterOption={(input, option) => {
                  if (option && option.children) {
                    return (
                      option.children
                        .toString()
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    )
                  }
                  return false
                }}
                filterSort={(optionA, optionB) => {
                  if (optionA.children && optionB.children) {
                    return optionA.children
                      .toString()
                      .toLowerCase()
                      .localeCompare(optionB.children.toString().toLowerCase())
                  }
                  return 0
                }}
                onChange={onMedicChange}
                loading={!medics}
              >
                {medics &&
                  medics.map((medic, index) => (
                    <Option key={index} value={medic.id}>
                      {medic.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Row>
              <Space size="large" direction="horizontal">
                <Form.Item
                  label="Fecha"
                  name="date"
                  rules={[
                    {
                      required: true,
                      message: "Fecha no valida"
                    }
                  ]}
                >
                  <DatePicker
                    allowClear
                    size="large"
                    format="DD/MM/YYYY"
                    disabledDate={disabledDates}
                    onChange={getAvailableHours}
                  />
                </Form.Item>
                <Form.Item
                  label="Horario"
                  name="time"
                  rules={[
                    {
                      required: true,
                      message: "Horario no valido"
                    }
                  ]}
                >
                  <TimePicker
                    size="large"
                    allowClear
                    format="HH:mm"
                    minuteStep={5}
                    disabled={disabledTime === undefined}
                    disabledTime={disabledTime}
                    onChange={(newTime) => {
                      newTime &&
                        detailsForm.setFieldsValue({
                          time: roundTimeToNextFiveSlot(newTime)
                        })
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Duracion (WIP)"
                  name="duration"
                  rules={[
                    {
                      required: false
                    }
                  ]}
                >
                  <InputNumber disabled defaultValue={30} />
                </Form.Item>
              </Space>
            </Row>
          </Form>
          {current === 2 && <>{getNewAppointmentSummary()}</>}
        </div>
      </div>
      <div style={{ marginTop: "2em" }} className="flex--space-between">
        <Button
          size="large"
          style={{ width: "150px" }}
          onClick={prev}
          disabled={current < 1}
        >
          Anterior
        </Button>
        {current < steps.length - 1 && (
          <Button
            size="large"
            style={{ width: "150px" }}
            type="primary"
            onClick={next}
          >
            Siguiente
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            size="large"
            style={{ width: "150px" }}
            type="primary"
            onClick={submit}
            loading={isLoading}
          >
            Finalizar
          </Button>
        )}
      </div>
    </Bubble>
  )
}

const roundTimeToNextFiveSlot = (time: Moment) => {
  const remainder = 5 - (time.minute() % 5)
  if (remainder === 0 || remainder === 5) return time

  const dateTime = moment(time).add(remainder, "minutes")

  return dateTime
}

const formStyle = {
  width: "100%",
  "@media (maxWidth: 1200px)": {
    width: "100%"
  }
}

const stepsStyle = {
  marginTop: "2em",
  padding: "2em",
  backgroundColor: "#fafafa",
  border: "1px dashed #e9e9e9",
  borderRadius: "2px"
}
