import { DatePicker, Form, Input, Modal } from "antd"
import moment, { Moment } from "moment"
import { errorNotification } from "../Notification"
import { EmrType } from "./model"

const { TextArea } = Input

type EmrSettingsProps = {
  visible: boolean
  handleOk: (emr: any) => void
  handleCancel: () => void
  emr?: EmrType
}

export const EmrSettingsModal = ({
  visible,
  handleOk,
  handleCancel,
  emr
}: EmrSettingsProps) => {
  const [form] = Form.useForm()

  const title = emr ? "Editar Historia Clinica" : "Nueva Historia Clinica"

  const disabledDates = (current: Moment) => {
    // Cannot select days before today
    return current && current < moment().startOf("day")
  }

  const submit = () => {
    form
      .validateFields()
      .then(() => {
        const values = {
          date: moment(form.getFieldsValue().date).format("DD/MM/YYYY"),
          text: form.getFieldsValue().text
        }
        handleOk(values)
        form.resetFields()
      })
      .catch((e) => {
        console.error(e)
        errorNotification("Error al añadir un paciente nuevo")
      })
  }

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={submit}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical" name="form">
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
            disabledDate={disabledDates}
          />
        </Form.Item>
        <Form.Item
          label="Contenido"
          name="text"
          rules={[
            {
              required: true,
              message: "Ingrese algo"
            }
          ]}
        >
          <TextArea showCount maxLength={1024} style={{ height: 120 }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
