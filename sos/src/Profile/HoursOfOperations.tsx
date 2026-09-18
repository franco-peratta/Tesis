import {
  Button,
  Checkbox,
  Col,
  Divider,
  Row,
  Space,
  TimePicker,
  Typography
} from "antd"
import moment from "moment"
import type { Moment } from "moment"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import { Provider, Shifts } from "./Model"

const { Title, Paragraph, Text } = Typography

const MAX_SHIFTS_PER_DAY = 4

type Day =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

type Props = {
  user: Provider
  setShifts: Function
}
export const HoursOfOperations = ({ user, setShifts }: Props) => {

  const user_shifts = JSON.parse(user.shifts) as Shifts

  const onChange = (value: any, day: Day, index: number) => {
    if (!value) return;
    const a: Moment = value[0]
    const b: Moment = value[1]
    const newShifts = { ...user_shifts }
    newShifts[day].shifts[index].from = a.hour()
    newShifts[day].shifts[index].to = b.hour()
    setShifts(newShifts)
  }

  const onChecked = (day: Day) => {
    const newShifts = { ...user_shifts }
    newShifts[day].available = !newShifts[day].available
    setShifts(newShifts)
  }

  const addShift = (day: Day) => {
    if (user_shifts[day].shifts.length >= MAX_SHIFTS_PER_DAY) return
    const newShifts = { ...user_shifts }
    newShifts[day].shifts.push({ from: 0, to: 0 })
    setShifts(newShifts)
  }

  const deleteShift = (day: Day) => {
    const newShifts = { ...user_shifts }
    newShifts[day].shifts.pop()
    setShifts(newShifts)
  }

  return (
    <>
      <Title>Horario</Title>
      <Paragraph type="secondary" style={{ maxWidth: "48em" }}>
        Estos son los días y las franjas en los que vas a estar disponible para
        atender. Los pacientes solo pueden solicitar turnos dentro de las
        franjas que definas acá.
      </Paragraph>
      <Paragraph type="secondary" style={{ maxWidth: "48em" }}>
        Tildá el día para habilitarlo y elegí desde qué hora hasta qué hora
        atendés. Podés agregar hasta {MAX_SHIFTS_PER_DAY} franjas por día, por
        ejemplo una a la mañana y otra a la tarde. Los horarios se toman por
        hora completa: si elegís 9, el primer turno del día arranca a las 9:00.
      </Paragraph>
      <Divider />
      {days.map((day) => (
        <div key={`key-${day.key}`}>
          <Row style={{ marginBottom: "1em" }}>
            <Col span={3}>
              <Checkbox
                defaultChecked={user_shifts[day.key].available}
                onChange={() => onChecked(day.key)}
              >
                <Title level={4}>{day.label}</Title>
              </Checkbox>
            </Col>
            <Col span={6}>
              <Space direction="vertical">
                {user_shifts[day.key].shifts.map((slot, i) => (
                  <div key={`${day.key}-slot-${i}`}>
                    <TimePicker.RangePicker
                      format="HH"
                      defaultValue={[
                        moment(slot.from, "HH"),
                        moment(slot.to, "HH")
                      ]}
                      disabled={!user_shifts[day.key].available}
                      onChange={(e) => onChange(e, day.key, i)}
                    />
                  </div>
                ))}
                {user_shifts[day.key].shifts.length === 0 && (
                  <Text type="secondary">
                    {user_shifts[day.key].available
                      ? "Sin franjas todavía: agregá una para poder recibir turnos este día"
                      : "Día no disponible"}
                  </Text>
                )}
              </Space>
            </Col>
            <Col span={6}>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={() => addShift(day.key)}
                disabled={
                  !user_shifts[day.key].available ||
                  user_shifts[day.key].shifts.length >= MAX_SHIFTS_PER_DAY
                }
              >
                Agregar franja
              </Button>
              {user_shifts[day.key].shifts.length > 1 ? (
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => deleteShift(day.key)}
                  disabled={!user_shifts[day.key].available}
                >
                  Quitar última
                </Button>
              ) : null}
            </Col>
          </Row>
          <Divider />
        </div>
      ))}
    </>
  )
}

type DaysObject = {
  key: Day
  label: string
}
const days: DaysObject[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miercoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" }
]
