import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Form,
    Typography,
    DatePicker,
    TimePicker,
    Row,
    Space,
    Button,
    Select,
    InputNumber
} from "antd"
import { useWatch } from "antd/es/form/Form"
import dayjs, { Dayjs } from "dayjs"
import localeData from "dayjs/plugin/localeData"
import weekday from "dayjs/plugin/weekday"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { getProvidersList, getOccupiedSlots, addAppointment } from "./handler"
import { Status } from "./model"
import { useAuth } from "../hooks/useAuth"
import { Provider, Shifts } from "../Provider/model"
import { errorNotification, successNotification } from "../components/Notification"

dayjs.extend(localeData)
dayjs.extend(weekday)
dayjs.extend(customParseFormat)

const { Option } = Select
const { Title, Text } = Typography

export const NewAppointment = () => {
    const navigate = useNavigate()

    const { user } = useAuth()

    const [detailsForm] = Form.useForm<{
        medic: number,
        date: Dayjs,
        time: Dayjs,
    }>()
    const [medics, setMedics] = useState<Provider[]>()
    const [isLoading, setIsLoading] = useState(true)
    const [disabledTime, setDisabledTime] = useState<any>()

    const selectedMedicId = useWatch("medic", detailsForm)

    useEffect(() => {
        Promise.all([getProvidersList()])
            .then(([{ data: medics }]) => {
                setMedics(medics)
                setIsLoading(false)
            })
            .catch(() => {
                errorNotification("Error al cargar los datos")
            })
    }, [])

    const disabledDates = (current: Dayjs) => {
        const disablePreviousDates = current && current.isBefore(dayjs().startOf("day"))

        const selectedMedic = medics?.find((m) => m.id === selectedMedicId)

        if (!selectedMedic) return disablePreviousDates

        const shifts = JSON.parse(selectedMedic.shifts) as Shifts
        const daysOff: number[] = []
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


    const getAvailableHours = async (date: Dayjs | null) => {
        if (!date) {
            setDisabledTime(undefined)
            return
        }

        const selectedMedic = medics?.find((m) => m.id === selectedMedicId)

        if (!selectedMedic) return

        const availableHours: number[] = []
        const shifts = JSON.parse(selectedMedic.shifts) as Shifts
        const day = date.locale('en').format("dddd").toLowerCase() as keyof typeof shifts

        for (const interval of shifts[day].shifts) {
            for (let i = interval.from; i < interval.to; i++) {
                availableHours.push(i)
            }
        }

        const unavailableHours = Array.from({ length: 24 }, (_, i) => i).filter(
            (hour) => !availableHours.includes(hour)
        )
        const { data: occupiedSlots } = await getOccupiedSlots(String(selectedMedicId), date)

        const hours = new Set<string>()
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
                            const minutes = new Set<number>()
                            for (const slot of occupiedSlots) {
                                const [slotHour, minute] = slot.split(":")
                                if (slotHour === hour.toString()) {
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
        detailsForm.setFieldsValue({ medic: parseInt(value), date: undefined })
    }

    const submit = async () => {
        setIsLoading(true)
        const patientId: string = user.id
        const {
            medic: providerId,
            date,
            time,
        } = detailsForm.getFieldsValue()

        const appointment = {
            status: Status.espera,
            date,
            time,
            duration: 30,
            providerId,
            patientId
        }

        try {
            const appDto = {
                date: appointment.date.format("YYYY-MM-DD"),
                time: appointment.time.format("HH:mm"),
                status: Status.espera,
                patientId: parseInt(patientId),
                providerId: appointment.providerId,
            }
            console.log(appDto)
            await addAppointment(appDto)
            successNotification("Turno creado correctamente")
            navigate("/")
        } catch (e) {
            errorNotification("Error al crear el turno")
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div>
                <Title>Nuevo turno</Title>
            </div>
            <div>
                <div style={formStyle}>
                    <Form
                        form={detailsForm}
                        layout="vertical"
                        name="details"
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
                                            message: "Fecha no válida"
                                        }
                                    ]}
                                >
                                    <DatePicker
                                        allowClear
                                        size="large"
                                        format="DD/MM/YYYY"
                                        disabled={!selectedMedicId}
                                        disabledDate={disabledDates}
                                        onChange={(d) => getAvailableHours(d)}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Horario"
                                    name="time"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Horario no válido"
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
                                    label="Duración"
                                    name="duration"
                                    rules={[
                                        {
                                            required: true
                                        }
                                    ]}
                                >
                                    <InputNumber disabled defaultValue={30} />
                                </Form.Item>
                            </Space>
                        </Row>
                    </Form>
                </div>
            </div>
            <div style={{ marginTop: "2em", display: "flex", gap: "1em" }}>
                <Button
                    size="large"
                    type="primary"
                    danger
                    onClick={() => { navigate("/") }}
                    loading={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    size="large"
                    type="primary"
                    onClick={submit}
                    loading={isLoading}
                >
                    Crear turno
                </Button>

            </div>
        </div>
    )
}

const roundTimeToNextFiveSlot = (time: Dayjs) => {
    const remainder = 5 - (time.minute() % 5)
    if (remainder === 0 || remainder === 5) return time

    return time.add(remainder, 'minute')
}

const formStyle = {
    width: "100%",
    "@media (maxWidth: 1200px)": {
        width: "100%"
    }
}
