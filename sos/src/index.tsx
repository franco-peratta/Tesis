import React from "react"
import ReactDOM from "react-dom/client"
import { RootComponent } from "./Init"
import "./index.less"

const rootElement = document.getElementById("root")
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RootComponent />
    </React.StrictMode>
  )
}
