import { Form, Input, Typography } from "antd"
import { Provider } from "./Model"

const { Title } = Typography
type Props = {
  user: Provider
  setUser: (user: Provider) => void
}
export const ProfileForm = ({ user }: Props) => {
  const [form] = Form.useForm()

  const handleChange = () => {
    const val = form.getFieldsValue()
    console.log(val)
  }

  // DISCLAIMER: SI HAGO NOMBRE Y MAIL EDITABLE, HAY QUE CAMBIAR EL USER EN LAS COOKIES TAMBIEN

  return (
    <>
      <Title>Perfil</Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: user.name,
          email: user.email
        }}
        onChange={handleChange}
      >
        <Form.Item name="name" label="Nombre" required>
          <Input disabled placeholder="Nombre" />
        </Form.Item>
        <Form.Item name="email" label="Email" required>
          <Input disabled placeholder="Email" />
        </Form.Item>
      </Form>
    </>
  )
}
