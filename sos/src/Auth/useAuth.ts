import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useAuth() {
  const { user, signin, signout } = useContext(AuthContext)
  return { user, signin, signout }
}
