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
  collapsed,
  setCollapsed
}: Props) => {
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  const onOk = (emr: EmrType) => {
    setVisible(false)
    const newPatientInfo = { ...patientInfo, emr }
    updateEMR(patientInfo.id, emr).then((res) => {
      setPatientInfo(newPatientInfo)
    })
  }

  const onCancel = () => {
    setVisible(false)
  }

  return (
    <>
      <div className="right-panel">
        {collapsed ? (
          <div className="collapse-container">
            <button
              className="collapse-button"
              onClick={() => setCollapsed(false)}
            >
              <LeftOutlined />
            </button>
          </div>
        ) : (
          <button
            className="collapse-button"
            onClick={() => setCollapsed(true)}
          >
            <RightOutlined />
          </button>
        )}
        {!collapsed && (
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
              <div>
                <Button
                  type="link"
                  size="large"
                  onClick={() => {
                    setVisible(true)
                  }}
                >
                  <Link strong>Historia Clinica</Link>
                  <FileTextOutlined style={{ marginLeft: ".5em" }} />
                </Button>
              </div>
            </div>
            <div>
              <Button
                type="primary"
                danger
                onClick={() => navigate(`/pacientes/${patientInfo.id}`)}
              >
                END CALL
              </Button>
            </div>
          </div>
        )}
      </div>
      <EmrModal
        visible={visible}
        data={patientInfo.emr}
        onOk={onOk}
        onCancel={onCancel}
      />
    </>
  )
}

type ModalProps = {
  visible: boolean
  data?: EmrType
  onOk: (emr: string) => void
  onCancel: () => void
}
const EmrModal = ({ visible, data, onOk, onCancel }: ModalProps) => {
  const [value, setValue] = useState(data ? data : "")

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
      visible={visible}
      onOk={() => {
        onOk(value)
      }}
      onCancel={onCancel}
      width="50%"
    >
      <RichTextEditor value={value} onChange={setValue} />
    </Modal>
  )
}
