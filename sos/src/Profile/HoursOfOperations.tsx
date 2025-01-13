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
import { Provider } from "./Model"

const { Title } = Typography

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
  const onChange = (value: any, day: Day, index: number) => {
    const a: Moment = value[0]
    const b: Moment = value[1]
    const newShifts = { ...user.shifts }
    newShifts[day].shifts[index].from = a.hour()
    newShifts[day].shifts[index].to = b.hour()
    setShifts(newShifts)
  }

  const onChecked = (day: Day) => {
    const newShifts = { ...user.shifts }
    newShifts[day].available = !newShifts[day].available
    setShifts(newShifts)
  }

  const addShift = (day: Day) => {
    if (user.shifts[day].shifts.length > 3) return
    const newShifts = { ...user.shifts }
    newShifts[day].shifts.push({ from: 0, to: 0 })
    setShifts(newShifts)
  }

  const deleteShift = (day: Day) => {
    const newShifts = { ...user.shifts }
    newShifts[day].shifts.pop()
    setShifts(newShifts)
  }

  return (
    <>
      <Title>Horas disponbles</Title>
      {days.map((day) => (
        <div key={`key-${day.key}`}>
          <Row style={{ marginBottom: "1em" }}>
            <Col span={3}>
              <Checkbox
                defaultChecked={user.shifts[day.key].available}
                onChange={() => onChecked(day.key)}
              >
                <Title level={4}>{day.label}</Title>
              </Checkbox>
            </Col>
            <Col span={6}>
              <Space direction="vertical">
                {user.shifts[day.key].shifts.map((slot, i) => (
                  <div key={`${day.key}-slot-${i}`}>
                    <TimePicker.RangePicker
                      format="HH"
                      defaultValue={[
                        moment(slot.from, "HH"),
                        moment(slot.to, "HH")
                      ]}
                      disabled={!user.shifts[day.key].available}
                      onChange={(e) => onChange(e, day.key, i)}
                    />
                  </div>
                ))}
                {user.shifts[day.key].shifts.length === 0 && (
                  <div>Sin horarios</div>
                )}
              </Space>
            </Col>
            <Col span={3}>
              <Button
                type="text"
                onClick={() => addShift(day.key)}
                disabled={!user.shifts[day.key].available}
              >
                <PlusOutlined />
              </Button>
              {user.shifts[day.key].shifts.length > 1 ? (
                <Button
                  type="text"
                  onClick={() => deleteShift(day.key)}
                  disabled={!user.shifts[day.key].available}
                >
                  <DeleteOutlined />
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
