import { Space, Button } from "antd"
import { useState } from "react"
import { EmrType } from "./model"
import { Patient } from "../Patient/model"
import { RichTextEditor } from "../UI/RichTextEditor"

type EmrProps = {
  patient: Patient
  updateEmr: (emr: EmrType) => void
}
export const EMR = ({ patient, updateEmr }: EmrProps) => {
  const [emrValue, setEmrValue] = useState(patient.emr)

  const handleSave = () => {
    updateEmr(emrValue)
  }

  const handleEmrChange = (newValue: string) => {
    setEmrValue(newValue)
  }

  return (
    <>
      <Space size="large" direction="vertical">
        <div>
          <RichTextEditor value={emrValue} onChange={handleEmrChange} />
        </div>
        <Button type="primary" onClick={handleSave}>
          Guardar
        </Button>
      </Space>
    </>
  )
}
