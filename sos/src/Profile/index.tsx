import { Button } from "antd"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Bubble } from "../components/Bubble"
import { Loader } from "../components/Loader"
import { NotFoundPage } from "../components/NotFoundPage"
import { getUserProfileById, updateUserProfile } from "./Handler"
import { HoursOfOperations } from "./HoursOfOperations"
import { ProfileForm } from "./ProfileForm"
import { Provider, Shifts } from "./Model"
import { errorNotification, successNotification } from "../Notification"

export const Profile = () => {
  const { id } = useParams()
  const [user, setUser] = useState<Provider>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchUser = () => {
    if (!id) return

    setLoading(true)
    setError(false)

    getUserProfileById(id)
      .then(({ data }) => {
        setUser(data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUser()
  }, [id])

  if (loading || !user) return <Loader />
  if (error || !id) return <NotFoundPage />

  const handleSave = () => {
    updateUserProfile(id, user)
      .then(() => {
        successNotification("El perfil se guardó correctamente")
        fetchUser() // re-fetch the updated profile
      })
      .catch(() => {
        errorNotification("Hubo un error al guardar el perfil")
      })
  }

  const setShifts = (shifts: Shifts) => {
    const newProvider: Provider = { ...user }
    newProvider.shifts = JSON.stringify(shifts)
    setUser(newProvider)
  }

  return (
    <Bubble>
      <ProfileForm user={user} setUser={setUser} />
      <HoursOfOperations user={user} setShifts={setShifts} />

      <Button
        style={{ display: "block", marginLeft: "auto", marginRight: "0" }}
        type="primary"
        onClick={handleSave}
      >
        Guardar
      </Button>
    </Bubble>
  )
}
