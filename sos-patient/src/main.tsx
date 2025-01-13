import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, type ThemeConfig } from 'antd'
import './index.css'

// const colors = {
//   "@body-background": "#fff",
//   "@primary-color": "#1CB5E2",
//   "@btn-primary-color": "#fff",
//   "@btn-primary-bg": "#002352"
// }

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1CB5E2'
  },
  components: {
    Button: {
      colorPrimary: '#002352'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
)
