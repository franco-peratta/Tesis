import { Route, Routes, Navigate, useLocation } from "react-router-dom"
import { NotFoundPage } from "./NotFoundPage"
import { useAuth } from "../Auth/useAuth"
import { LoginPage } from "../Auth"
import { Patients } from "../Patient"
import { PatientDetails } from "../Patient/PatientDetails"
import { PatientForm } from "../Patient/PatientForm"
import { Profile } from "../Profile"
import { Page } from "./Page"
import { Appointments } from "../Appointments"
import { NewAppointment } from "../Appointments/NewAppointment"
import { Videocall } from "../Videocall"

export const routes = (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<Page />}>
      <Route
        path="/"
        element={
          <RequireAuth>
            <Navigate to="/pacientes" />
          </RequireAuth>
        }
      />
      <Route
        path="/pacientes"
        element={
          <RequireAuth>
            <Patients />
          </RequireAuth>
        }
      />
      <Route
        path="/pacientes/:id"
        element={
          <RequireAuth>
            <PatientDetails />
          </RequireAuth>
        }
      />
      {/* <Route
      path="/pacientes/editar/:id"
      element={
        <RequireAuth>
          <PatientForm />
        </RequireAuth>
      }
    /> */}
      <Route
        path="/pacientes/nuevo"
        element={
          <RequireAuth>
            <PatientForm />
          </RequireAuth>
        }
      />
      <Route
        path="/perfil/:id"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/turnos"
        element={
          <RequireAuth>
            <Appointments />
          </RequireAuth>
        }
      />
      <Route
        path="/turnos/nuevo"
        element={
          <RequireAuth>
            <NewAppointment />
          </RequireAuth>
        }
      />
      <Route
        path="/videocall/:appointmentId"
        element={
          <RequireAuth>
            <Videocall />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <RequireAuth>
            <NotFoundPage />
          </RequireAuth>
        }
      />
    </Route>
  </Routes>
)

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
