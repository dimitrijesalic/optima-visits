import { POST } from '@/src/app/api/visits/import/route'
import prisma from '@/src/lib/prisma'

jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findMany: jest.fn() },
    visit: { createMany: jest.fn() },
  },
}))

const mockFindManyUsers = prisma.user.findMany as jest.Mock
const mockCreateMany = prisma.visit.createMany as jest.Mock

const VALID_API_KEY = 'test-api-key'

function makeRequest(body: unknown, apiKey?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) headers['x-api-key'] = apiKey

  return new Request('http://localhost:3000/api/visits/import', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const validVisit = {
  email: 'user@optima.rs',
  plannedTopic: 'Sales review',
  plannedVisitDate: '2026-03-01',
  plannedVisitTime: '10:00',
  businessPartner: 'Acme Corp',
  plannedVisitDuration: '60 min',
}

describe('POST /api/visits/import', () => {
  beforeEach(() => {
    process.env.API_KEY = VALID_API_KEY
    mockFindManyUsers.mockResolvedValue([
      { id: 'user-1', email: 'user@optima.rs' },
    ])
    mockCreateMany.mockResolvedValue({ count: 1 })
  })

  afterEach(() => {
    delete process.env.API_KEY
  })

  it('returns 401 when no API key is provided', async () => {
    const response = await POST(makeRequest([validVisit]))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 401 when API key is invalid', async () => {
    const response = await POST(makeRequest([validVisit], 'wrong-key'))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 400 when body is not an array', async () => {
    const response = await POST(makeRequest(validVisit, VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Request body must be an array')
  })

  it('returns 400 when body is empty array', async () => {
    const response = await POST(makeRequest([], VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Request body must not be empty')
  })

  it('returns 400 when user email is not found', async () => {
    mockFindManyUsers.mockResolvedValue([])

    const response = await POST(makeRequest([validVisit], VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toContain('Users not found')
    expect(body.message).toContain('user@optima.rs')
  })

  it('creates visits with PENDING status and returns 201', async () => {
    const response = await POST(makeRequest([validVisit], VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.message).toBe('1 visits created')

    expect(mockCreateMany).toHaveBeenCalledWith({
      data: [
        {
          userId: 'user-1',
          status: 'PENDING',
          plannedTopic: 'Sales review',
          plannedVisitDate: '2026-03-01',
          plannedVisitTime: '10:00',
          businessPartner: 'Acme Corp',
          plannedVisitDuration: '60 min',
        },
      ],
    })
  })

  it('handles multiple visits for different users', async () => {
    mockFindManyUsers.mockResolvedValue([
      { id: 'user-1', email: 'user@optima.rs' },
      { id: 'user-2', email: 'admin@optima.rs' },
    ])
    mockCreateMany.mockResolvedValue({ count: 2 })

    const visits = [
      validVisit,
      { ...validVisit, email: 'admin@optima.rs', businessPartner: 'Other Corp' },
    ]

    const response = await POST(makeRequest(visits, VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.message).toBe('2 visits created')
  })

  it('returns 400 when an error is thrown', async () => {
    mockFindManyUsers.mockRejectedValue(new Error('DB error'))

    const response = await POST(makeRequest([validVisit], VALID_API_KEY))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Failed to import visits')
  })
})
