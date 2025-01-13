import { BrowserRouter } from "react-router-dom"
import { routes } from "../components/routes"
import { AuthProvider } from "../Auth/AuthContext"

import "antd/dist/antd.less"

export const RootComponent = () => {
  return (
    <BrowserRouter>
      <AuthProvider>{routes}</AuthProvider>
    </BrowserRouter>
  )
}
