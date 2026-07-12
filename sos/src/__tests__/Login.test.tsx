import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../Auth/Login'

jest.mock('../Auth/useAuth', () => ({
  useAuth: () => ({ user: null, signin: jest.fn(), signout: jest.fn() }),
}))

jest.mock('../http', () => ({
  http: jest.fn(),
}))

jest.mock('../Notification', () => ({
  errorNotification: jest.fn(),
  successNotification: jest.fn(),
  infoNotification: jest.fn(),
}))

jest.mock('antd', () => {
  const MockForm: any = ({ children }: any) => <form>{children}</form>
  MockForm.Item = ({ children, label }: any) => (
    <div>
      {label && <label>{label}</label>}
      {children}
    </div>
  )
  MockForm.useForm = () => [
    {
      validateFields: jest.fn().mockResolvedValue({ email: '', password: '' }),
      getFieldValue: jest.fn(),
      setFieldsValue: jest.fn(),
    },
  ]

  const MockInput: any = (props: any) => <input {...props} />
  MockInput.Password = (props: any) => <input type="password" {...props} />

  return {
    Button: ({ children, loading }: any) => (
      <button disabled={!!loading}>{children}</button>
    ),
    Form: MockForm,
    Input: MockInput,
    Layout: {
      Content: ({ children }: any) => <div>{children}</div>,
    },
    Image: ({ src, alt }: any) => <img src={src} alt={alt} />,
  }
})

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )

describe('LoginPage', () => {
  it('renders the email label', () => {
    renderLogin()
    expect(screen.getByText(/^email$/i)).toBeInTheDocument()
  })

  it('renders the password label', () => {
    renderLogin()
    expect(screen.getByText(/contraseña/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument()
  })

  it('renders a password input', () => {
    renderLogin()
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()
  })
})
