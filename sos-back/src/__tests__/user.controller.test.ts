import { Request } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../config/db'
import { deleteUser, getUserById, updateUser } from '../controllers/user'

jest.mock('../config/db', () => ({
  prisma: {
    user: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    patient: { delete: jest.fn() },
    provider: { delete: jest.fn() },
    $transaction: jest.fn(),
  },
}))
jest.mock('bcrypt')

const mockPrisma = prisma as unknown as {
  user: { findUniqueOrThrow: jest.Mock; update: jest.Mock; delete: jest.Mock }
  patient: { delete: jest.Mock }
  provider: { delete: jest.Mock }
  $transaction: jest.Mock
}
const mockHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn(),
  end: jest.fn(),
})

describe('getUserById controller', () => {
  beforeEach(() => jest.clearAllMocks())

  it('never selects the password field', async () => {
    const req = { params: { id: '1' } } as unknown as Request
    const res = makeRes()
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 1, email: 'doc@sos.com', role: 'provider',
    })

    await getUserById(req, res as any)

    const select = mockPrisma.user.findUniqueOrThrow.mock.calls[0][0].select
    expect(select).toBeDefined()
    expect(select.password).toBeUndefined()
  })
})

describe('updateUser controller', () => {
  beforeEach(() => jest.clearAllMocks())

  it('hashes the password instead of storing it as plain text', async () => {
    const req = {
      params: { id: '1' },
      body: { email: 'doc@sos.com', password: 'nueva-pass' },
    } as unknown as Request
    const res = makeRes()
    mockHash.mockResolvedValue('hashed-pass' as never)
    mockPrisma.user.update.mockResolvedValue({ id: 1, email: 'doc@sos.com' })

    await updateUser(req, res as any)

    const { data } = mockPrisma.user.update.mock.calls[0][0]
    expect(mockHash).toHaveBeenCalledWith('nueva-pass', 10)
    expect(data.password).toBe('hashed-pass')
    expect(data.password).not.toBe('nueva-pass')
  })

  it('ignores role so a patient cannot promote itself to provider', async () => {
    const req = {
      params: { id: '1' },
      body: { email: 'pac@sos.com', role: 'provider' },
    } as unknown as Request
    const res = makeRes()
    mockPrisma.user.update.mockResolvedValue({ id: 1, role: 'patient' })

    await updateUser(req, res as any)

    const { data } = mockPrisma.user.update.mock.calls[0][0]
    expect(data.role).toBeUndefined()
  })

  it('leaves the password untouched when the body does not carry one', async () => {
    const req = {
      params: { id: '1' },
      body: { email: 'otro@sos.com' },
    } as unknown as Request
    const res = makeRes()
    mockPrisma.user.update.mockResolvedValue({ id: 1, email: 'otro@sos.com' })

    await updateUser(req, res as any)

    const { data } = mockPrisma.user.update.mock.calls[0][0]
    expect('password' in data).toBe(false)
    expect(mockHash).not.toHaveBeenCalled()
  })
})

describe('deleteUser controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Ejecuta el callback de la transacción con el propio mock de prisma.
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockPrisma))
  })

  it('deletes the patient profile before the user and answers once', async () => {
    const req = { params: { id: '1' } } as unknown as Request
    const res = makeRes()
    const order: string[] = []
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 1, patient: { id: 1 }, provider: null,
    })
    mockPrisma.patient.delete.mockImplementation(async () => {
      order.push('patient')
    })
    mockPrisma.user.delete.mockImplementation(async () => {
      order.push('user')
    })

    await deleteUser(req, res as any)

    // Al revés, la baja fallaba con P2003 por la foreign key del perfil.
    expect(order).toEqual(['patient', 'user'])
    expect(res.status).toHaveBeenCalledTimes(1)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.json).not.toHaveBeenCalled()
  })

  it('deletes the provider profile before the user', async () => {
    const req = { params: { id: '2' } } as unknown as Request
    const res = makeRes()
    const order: string[] = []
    mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 2, patient: null, provider: { id: 2 },
    })
    mockPrisma.provider.delete.mockImplementation(async () => {
      order.push('provider')
    })
    mockPrisma.user.delete.mockImplementation(async () => {
      order.push('user')
    })

    await deleteUser(req, res as any)

    expect(order).toEqual(['provider', 'user'])
    expect(res.status).toHaveBeenCalledWith(204)
  })

  it('returns 404 when the user does not exist', async () => {
    const req = { params: { id: '99' } } as unknown as Request
    const res = makeRes()
    mockPrisma.user.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' })

    await deleteUser(req, res as any)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(mockPrisma.user.delete).not.toHaveBeenCalled()
  })
})
