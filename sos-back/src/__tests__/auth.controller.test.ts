import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { login } from '../controllers/auth'
import { getUserByEmail } from '../repos/user'

jest.mock('../repos/user')
jest.mock('../repos/patient')
jest.mock('../repos/provider')
jest.mock('bcrypt')
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mocked.jwt.token'),
}))

const mockGetUserByEmail = getUserByEmail as jest.MockedFunction<typeof getUserByEmail>
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
})

describe('login controller', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'pass123' }, hostname: 'localhost' } as Request
    const res = makeRes()
    await login(req, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('incompletos') })
    )
  })

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'a@b.com' }, hostname: 'localhost' } as Request
    const res = makeRes()
    await login(req, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 401 when user does not exist', async () => {
    const req = { body: { email: 'nobody@x.com', password: 'pass' }, hostname: 'localhost' } as Request
    const res = makeRes()
    mockGetUserByEmail.mockResolvedValue(null)
    await login(req, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Credenciales Incorrectas' })
    )
  })

  it('returns 401 when password does not match', async () => {
    const req = { body: { email: 'doc@sos.com', password: 'wrong' }, hostname: 'localhost' } as Request
    const res = makeRes()
    mockGetUserByEmail.mockResolvedValue({
      id: 1, email: 'doc@sos.com', password: 'hashed', role: 'provider',
    } as any)
    mockBcryptCompare.mockResolvedValue(false as never)
    await login(req, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('returns token and user data on successful login', async () => {
    const req = { body: { email: 'doc@sos.com', password: 'correct' }, hostname: 'localhost' } as Request
    const res = makeRes()
    mockGetUserByEmail.mockResolvedValue({
      id: 1, email: 'doc@sos.com', password: 'hashed', role: 'provider',
    } as any)
    mockBcryptCompare.mockResolvedValue(true as never)
    await login(req, res as any)
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: 'mocked.jwt.token',
          user: expect.objectContaining({ email: 'doc@sos.com' }),
        }),
      })
    )
  })
})
