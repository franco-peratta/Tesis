import { Layout } from "antd"
import { HeaderComponent } from "./HeaderComponent"
import { Outlet } from "react-router-dom"

import "./styles.less"
import "../../UI/global_styles.less"

export const Page = () => {
  return (
    <Layout className="layout">
      <HeaderComponent />
      <Layout>
        <main id="main" className="content">
          <Outlet />
        </main>
      </Layout>
    </Layout>
  )
}
