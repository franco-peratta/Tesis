import { useEffect, useState } from "react"
import { Jitsi } from "./jitsi"
import { useNavigate, useParams } from "react-router-dom"
import { Loader } from "../components/Loader"
import { infoNotification } from "../Notification"
import {
  getAppointmentById,
  changeAppointmentStatusById
} from "../Appointments/Handler"
import { RightPanel } from "./RightPanel"
import "./styles.css"

export const Videocall = () => {
  const navigate = useNavigate()
  const { appointmentId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [appointment, setAppointment] = useState()

  useEffect(() => {
    document.getElementById("main").style.paddingLeft = 0
    document.getElementById("main").style.paddingRight = 0
    document.getElementById("main").style.paddingTop = 0
  }, [])

  useEffect(() => {
    getAppointmentById(appointmentId)
      .then(({ data }) => {
        setAppointment(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err)
      })
  }, [appointmentId])

  if (loading) return <Loader />
  if (error) return <span>Error page goes here | {error}</span>

  const handleMeetingEnd = async () => {
    infoNotification("Videollamada finaliza")
    await changeAppointmentStatusById(appointment.id, "terminado")
    navigate("/")
  }

  const handleParticipantLeft = async () => {
    console.log("PARTICIPANT LEFT")
  }

  const setPatientInfo = (patientInfo) => {
    setAppointment((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        ...patientInfo
      }
    }))
  }

  // displayName no estaria funcionando
  // password funciona para el paciente SOLO si el medico se metio antes
  const { roomName, displayName, password } = {
    roomName: appointment.id,
    displayName: `Turno con ${appointment.patient.name}`,
    password: appointment.patient.dni
  }

  return (
    <div
      className="videocall-container"
      style={{
        gridTemplateColumns: `75% auto`,
        height: "100%",
        width: "100%"
      }}
    >
      <Jitsi
        containerStyles={{ height: "100%", width: "100%" }}
        roomName={roomName}
        displayName={displayName}
        password={password}
        onMeetingEnd={handleMeetingEnd}
        onParticipantLeft={handleParticipantLeft}
        loadingComponent={<p>loading ...</p>}
        errorComponent={<p>Oops, something went wrong...</p>}
      />
      <RightPanel
        patientInfo={appointment.patient}
      />
    </div>
  )
}
