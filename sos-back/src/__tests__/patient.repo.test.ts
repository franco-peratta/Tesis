import bcrypt from 'bcrypt'
import { prisma } from '../config/db'
import { addPatient } from '../repos/patient'

jest.mock('../config/db', () => ({
  prisma: { patient: { create: jest.fn() } },
}))
jest.mock('bcrypt')

const mockPrisma = prisma as unknown as { patient: { create: jest.Mock } }
const mockHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>

const newPatient = {
  email: 'pac@sos.com',
  name: 'Paciente Nuevo',
  dni: '38919769',
  dob: '1995-06-20',
  phoneNumber: '2914628934',
  emr: '',
} as any

describe('addPatient — initial password', () => {
  const originalEnv = process.env.DEFAULT_PATIENT_PASSWORD

  beforeEach(() => {
    jest.clearAllMocks()
    mockHash.mockResolvedValue('hashed' as never)
    mockPrisma.patient.create.mockResolvedValue({ id: 1 })
  })

  afterEach(() => {
    process.env.DEFAULT_PATIENT_PASSWORD = originalEnv
  })

  it('falls back to DEFAULT_PATIENT_PASSWORD when the body carries no password', async () => {
    process.env.DEFAULT_PATIENT_PASSWORD = 'desde-el-entorno'

    await addPatient({ ...newPatient })

    expect(mockHash).toHaveBeenCalledWith('desde-el-entorno', 10)
  })

  it('prefers the password from the body over the environment default', async () => {
    process.env.DEFAULT_PATIENT_PASSWORD = 'desde-el-entorno'

    await addPatient({ ...newPatient, password: 'elegida-por-el-usuario' })

    expect(mockHash).toHaveBeenCalledWith('elegida-por-el-usuario', 10)
  })

  it('throws instead of falling back to a hardcoded password when the variable is missing', async () => {
    delete process.env.DEFAULT_PATIENT_PASSWORD

    await expect(addPatient({ ...newPatient })).rejects.toThrow(
      /DEFAULT_PATIENT_PASSWORD/
    )
    expect(mockPrisma.patient.create).not.toHaveBeenCalled()
  })
})
