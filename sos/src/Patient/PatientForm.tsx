import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CloseOutlined } from "@ant-design/icons"
import { Form, Input, DatePicker, Row, Space, Typography, Button } from "antd"
import { Bubble } from "../components/Bubble"
import { addPatient } from "./Handler"
import { toPatients } from "./routes"
import { errorNotification, successNotification } from "../Notification"
import type { Moment } from "moment"

const { Title } = Typography

type TForm = {
  name: string
  dni: string
  email: string
  phoneNumber: string
  dob: Moment
}

export const PatientForm = (_props: {}) => {
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm<TForm>()
  const navigate = useNavigate()

  const submit = () => {
    setLoading(true)
    const values = form.getFieldsValue()
    form
      .validateFields()
      .then(async () => {
        try {
          await addPatient({
            ...values,
            dob: values.dob.format("DD/MM/YYYY"),
            emr: ""
          })
          setLoading(false)
          successNotification("Paciente agregado correctamente")
          navigate(toPatients())
        } catch (error: any) {
          errorNotification(error?.message)
          setLoading(false)
        }
      })
      .catch((e) => {
        console.error(e)
        errorNotification("Error al añadir un paciente nuevo")
        setLoading(false)
      })
  }

  return (
    <Bubble>
      <div className="flex--space-between">
        <Title>Nuevo paciente</Title>
        <CloseOutlined
          style={{ fontSize: "1.5em" }}
          onClick={() => {
            navigate(toPatients())
          }}
        />
      </div>
      <Form form={form} layout="vertical" name="details" onFinish={() => {}}>
        <Form.Item
          name="name"
          label="Nombre completo"
          rules={[{ required: true, message: "Por favor, ingrese su nombre" }]}
        >
          <Input allowClear size="large" placeholder="Nombre" />
        </Form.Item>
        <Form.Item
          name="dni"
          label="DNI"
          rules={[
            {
              required: true,
              message: "Por favor, ingrese su DNI"
            }
          ]}
        >
          <Input type="number" allowClear size="large" placeholder="DNI" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Correo Electronico"
          rules={[
            {
              type: "email",
              message: "La direccion de correo electronico no es valida"
            },
            {
              required: true,
              message: "Por favor, ingrese su direccion de correo electronico"
            }
          ]}
        >
          <Input allowClear size="large" placeholder="ejemplo@email.com" />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Numero de telefono"
          rules={[
            {
              required: true,
              message: "Por favor, ingrese su numero de telefono"
            }
          ]}
        >
          <Input
            type="number"
            allowClear
            size="large"
            placeholder="Numero de telefono"
          />
        </Form.Item>
        <Row>
          <Space size="large" direction="horizontal">
            <Form.Item
              label="Fecha de nacimiento"
              name="dob"
              rules={[
                {
                  required: true,
                  message: "Fecha no valida"
                }
              ]}
            >
              <DatePicker
                style={{ width: "15em" }}
                placeholder="Fecha de nacimiento"
                allowClear
                size="large"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </Space>
        </Row>
      </Form>
      <Button
        size="large"
        style={{ width: "150px" }}
        type="primary"
        onClick={submit}
        loading={loading}
      >
        Finalizar
      </Button>
    </Bubble>
  )
}
