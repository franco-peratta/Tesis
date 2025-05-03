import { useState } from "react"
import {
  LeftOutlined,
  RightOutlined,
  FileTextOutlined
} from "@ant-design/icons"
import { Space, Typography, Divider, Button, Modal } from "antd"
import moment from "moment"
import { updateEMR } from "../EMR/Handler"
import { EmrType } from "../EMR/model"
import { RichTextEditor } from "../UI/RichTextEditor"
import { Patient } from "../Patient/model"
import { useNavigate } from "react-router-dom"
import { EMR } from "../EMR"
import { errorNotification, successNotification } from "../Notification"

const { Title, Text, Link } = Typography

function calculateAge(dob: string): number {
  // Try to parse the date using moment
  const parsedDate = moment(dob, moment.ISO_8601, true)
  // If the parsing was unsuccessful, try common date formats
  if (!parsedDate.isValid()) {
    const commonFormats = [
      "MM-DD-YYYY",
      "MM/DD/YYYY",
      "DD-MM-YYYY",
      "DD/MM/YYYY",
      "YYYY-MM-DD",
      "YYYY/MM/DD",
      "DD MMM YYYY",
      "MMM DD, YYYY"
    ]
    for (const format of commonFormats) {
      const date = moment(dob, format, true)
      if (date.isValid()) {
        return moment().diff(date, "years")
      }
    }
    // If none of the formats worked, return -1 to indicate an invalid date
    return -1
  }

  return moment().diff(parsedDate, "years")
}

type Props = {
  patientInfo: Patient
  collapsed: boolean
  setCollapsed: (val: boolean) => void
  setPatientInfo: (patient: Patient) => void
}
export const RightPanel = ({
  patientInfo,
  setPatientInfo,
}: Props) => {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  const close = () => {
    setVisible(false)
  }

  return (
    <>
      <div className="right-panel">
        <div className="details">
          <div className="">
            <Space direction="vertical">
              <Title className="title">{patientInfo.name}</Title>
              <Text type="secondary">{patientInfo.email}</Text>
              <Text className="dob">
                Fecha de nacimiento: {patientInfo.dob} -{" "}
                {calculateAge(patientInfo.dob)} años
              </Text>
            </Space>
            <Divider />
          </div>
          <div style={{ display: "flex", flexDirection: "column", height: "75vh" }}>
            <Space direction="vertical" style={{ width: "100%", flexGrow: 1 }}>
              <Button
                type="default"
                size="large"
                block
                onClick={() => setVisible(true)}
              >
                <FileTextOutlined style={{}} />
                <>Historia Clinica</>
              </Button>

              <Button
                type="primary"
                size="large"
                block
                onClick={() => console.log("Crear turno")}
              >
                <FileTextOutlined style={{}} />
                Crear turno

              </Button>
            </Space>

            <div style={{ marginTop: "auto", width: "100%" }}>
              <Button
                type="primary"
                danger
                block
                size="large"
                style={{ height: "60px" }}
                onClick={() => navigate(`/pacientes/${patientInfo.id}`)}
              >
                Finalizar Llamada
              </Button>
            </div>
          </div>
        </div>
      </div>
      <EmrModal
        visible={visible}
        patient={patientInfo}
        onOk={close}
        onCancel={close}
      />
    </>
  )
}

type ModalProps = {
  visible: boolean
  patient: Patient
  onOk: () => void
  onCancel: () => void
}
const EmrModal = ({ visible, patient, onOk, onCancel }: ModalProps) => {

  const [emr, setEmrValue] = useState(patient.emr)

  const changeEmr = (emr: string) => {
    updateEMR(patient.id, emr)
      .then((res) => {
        const newEmr = res.data.emr
        successNotification("Historia clinica actualizada con exito")
      })
      .catch((e) => {
        errorNotification("Error al actualizar la historia clinica")
        console.error(e)
      })
  }

  const ModalTitle = () => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Title level={4} style={{ margin: 0 }}>
        Historia Clinica
      </Title>
    </div>
  )

  return (
    <Modal
      title={<ModalTitle />}
      open={visible}
      onOk={() => {
        onOk()
      }}
      onCancel={onCancel}
      width="75%"
    >
      <EMR
        initialMarkdown={emr}
        onSave={(markdown: string) => changeEmr(markdown)}
      />
    </Modal>
  )
}
