import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import { Appointments } from "../Appointments"
import { EditProfile, Profile } from "../Patient"
import { Login } from "./Login"
import { Page } from "./Page"
import { useAuth } from "../hooks/useAuth"

export const Routing = () => {
	return (
		<Routes>
			<Route element={<Page />}>
				<Route path="/login" element={<Login />} />
				<Route
					path="/"
					element={
						<RequireAuth>
							<Appointments />
						</RequireAuth>
					}
				/>
				<Route
					path="/profile"
					element={
						<RequireAuth>
							<Profile />
						</RequireAuth>
					}
				/>
				<Route
					path="/profile/edit"
					element={
						<RequireAuth>
							<EditProfile />
						</RequireAuth>
					}
				/>
				<Route
					path="*"
					element={
						<RequireAuth>
							<div>404</div>
						</RequireAuth>
					}
				/>
			</Route>
		</Routes>
	)
}

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
