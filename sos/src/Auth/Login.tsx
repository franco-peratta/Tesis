import { Button, Form, Input, Layout, Image } from "antd"
import { useState } from "react"
import { useAuth } from "./useAuth"
import { Navigate } from "react-router-dom"
import { http } from "../http"
import { errorNotification } from "../Notification"

const emailRegex =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

type FormT = {
  name: string
  email: string
  password: string
}

interface TLogin {
  token: string
  user: {
    id: number
    email: string
  }
}

export const LoginPage = () => {
  const [form] = Form.useForm<FormT>()
  const [loading, setLoading] = useState(false)

  const { user, signin } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  const onFinish = () => {
    setLoading(true)
    form
      .validateFields()
      .then(({ email, password }) => {
        http<TLogin>("POST", "/auth/login", {
          params: { email, password, role: "provider" }
        })
          .then(({ data }) => {
            signin(data.token, data.user)
          })
          .catch((err) => {
            console.error({ err })
            errorNotification("Datos inválidos")
          })
          .finally(() => {
            setLoading(false)
          })
      })
      .catch((err) => {
        setLoading(false)
        console.error(err)
      })
  }

  const onFinishFailed = (errorInfo: any) => {
    console.error("Failed:", errorInfo)
  }

  return (
    <Layout.Content
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100vh"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2em",
          padding: "2.5em",
          border: "1px solid black",
          alignItems: "center"
        }}
      >
        <Image
          src="/img/sos-logo.png"
          alt="Salud Online Solidaria"
          preview={false}
        />

        <Form
          form={form}
          style={{ width: "max(25vw, 300px)" }}
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Ingrese un email válido",
                pattern: emailRegex
              }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingrese su contraseña" }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              shape="round"
              htmlType="submit"
              loading={loading}
              style={{ marginTop: "1em", height: "3em", width: "100%" }}
            >
              Iniciar Sesion
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout.Content>
  )
}
