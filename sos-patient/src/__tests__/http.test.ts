import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '../http'

// Mock fetch globally
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

// Provide a value for import.meta.env.VITE_API_URL
vi.stubEnv('VITE_API_URL', 'http://localhost:3000')

const makeOkResponse = (body: object) =>
  ({ ok: true, json: vi.fn().mockResolvedValue(body) } as unknown as Response)

const makeErrorResponse = (status: number, body: object = {}) =>
  ({
    ok: false,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response)

describe('http client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear document cookie between tests
    document.cookie = 'token=; max-age=0'
  })

  it('sends a GET request to the correct URL', async () => {
    fetchMock.mockResolvedValue(makeOkResponse({ data: [] }))
    await http('GET', '/appointments')
    const calledUrl: string = fetchMock.mock.calls[0][0]
    expect(calledUrl).toContain('/appointments')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('appends query params to GET requests', async () => {
    fetchMock.mockResolvedValue(makeOkResponse({ data: [] }))
    await http('GET', '/appointments', { params: { status: 'espera' } })
    const calledUrl: string = fetchMock.mock.calls[0][0]
    expect(calledUrl).toContain('status=espera')
  })

  it('sends POST body as JSON', async () => {
    fetchMock.mockResolvedValue(makeOkResponse({ data: { id: 1 } }))
    await http('POST', '/appointments', { params: { patientId: 5 } })
    const fetchInit: RequestInit = fetchMock.mock.calls[0][1]
    expect(fetchInit.body).toBe(JSON.stringify({ patientId: 5 }))
  })

  it('includes Authorization header when token cookie is present', async () => {
    document.cookie = 'token=my.jwt.token'
    fetchMock.mockResolvedValue(makeOkResponse({ data: null }))
    await http('GET', '/me')
    const fetchInit: RequestInit = fetchMock.mock.calls[0][1]
    const headers = fetchInit.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my.jwt.token')
  })

  it('throws when the response is not ok', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(404, { message: 'Not found' })
    )
    await expect(http('GET', '/missing')).rejects.toThrow('Not found')
  })
})
