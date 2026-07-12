import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { auth } from '../middlewares/auth'
import { getUserById } from '../repos/user'

jest.mock('jsonwebtoken')
jest.mock('../repos/user')

const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>
const mockVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>

describe('auth middleware', () => {
  let mockReq: Partial<Request> & { user?: any }
  let mockRes: { status: jest.Mock; send: jest.Mock }
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()
    mockReq = { header: jest.fn() }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }
    mockNext = jest.fn()
  })

  it('returns 401 when Authorization header is absent', async () => {
    ;(mockReq.header as jest.Mock).mockReturnValue(undefined)
    await auth(mockReq as any, mockRes as any, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.send).toHaveBeenCalledWith({ error: 'Authentication failed' })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('returns 401 when token is malformed', async () => {
    ;(mockReq.header as jest.Mock).mockReturnValue('Bearer badtoken')
    mockVerify.mockImplementation(() => { throw new Error('invalid signature') })
    await auth(mockReq as any, mockRes as any, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('returns 401 when user no longer exists in database', async () => {
    ;(mockReq.header as jest.Mock).mockReturnValue('Bearer validtoken')
    mockVerify.mockReturnValue({ id: 99 } as any)
    mockGetUserById.mockResolvedValue(null as any)
    await auth(mockReq as any, mockRes as any, mockNext)
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('calls next and attaches user to request when token is valid', async () => {
    const fakeUser = { id: 1, email: 'doc@sos.com', role: 'provider' }
    ;(mockReq.header as jest.Mock).mockReturnValue('Bearer validtoken')
    mockVerify.mockReturnValue({ id: 1 } as any)
    mockGetUserById.mockResolvedValue(fakeUser as any)
    await auth(mockReq as any, mockRes as any, mockNext)
    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.user).toEqual(fakeUser)
    expect(mockRes.status).not.toHaveBeenCalled()
  })
})
