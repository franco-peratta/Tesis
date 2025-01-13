import { createContext, type ReactNode, useState } from "react"
import { useCookies } from "react-cookie"

interface AuthContextType {
  user: any
  signin: (token: string, user: User, callback?: VoidFunction) => void
  signout: () => void
}

interface User {
  id: number
  email: string
}

export const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cookies, setCookie, removeCookie] = useCookies(["token", "user"])

  const [user, setUser] = useState<User | null>(() => {
    if (!cookies.token || !cookies.user) return null
    return JSON.parse(atob(cookies.user))
  })

  const signin = (token: string, user: User, callback?: VoidFunction) => {
    setUser(user)

    setCookie("token", token, {
      path: "/",
      sameSite: true,
      secure: true,
      expires: new Date(Date.now() + 3 * 60 * 60 * 1000)
    })

    setCookie("user", btoa(JSON.stringify(user)), {
      path: "/",
      sameSite: true,
      secure: true,
      expires: new Date(Date.now() + 3 * 60 * 60 * 1000)
    })

    callback && callback()
  }

  const signout = () => {
    setUser(null)
    removeCookie("token", { path: "/" })
    removeCookie("user", { path: "/" })
  }

  const value = { user, signin, signout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
