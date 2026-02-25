import { GET } from '@/src/app/api/visits/route'
import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'
import {
  mockAdminUser,
  mockRegularUser,
  mockPendingVisit,
} from '../../helpers/fixtures'

jest.mock('@/src/lib/get-user-from-session', () => ({
  getUserFromSession: jest.fn(),
}))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: {
    visit: { findMany: jest.fn(), count: jest.fn() },
  },
}))

const mockGetUser = getUserFromSession as jest.Mock
const mockFindMany = prisma.visit.findMany as jest.Mock
const mockCount = prisma.visit.count as jest.Mock

function makeRequest(queryString = '') {
  return new Request(`http://localhost:3000/api/visits${queryString}`)
}

describe('GET /api/visits', () => {
  beforeEach(() => {
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
  })

  it('returns 401 when getUserFromSession returns error', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 401 when user is null', async () => {
    mockGetUser.mockResolvedValue({ user: null })

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('ADMIN sees all visits (no userId filter)', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })

    await GET(makeRequest())

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    )
  })

  it('USER sees only own visits (userId filter applied)', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    await GET(makeRequest())

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: mockRegularUser.id,
        }),
      })
    )
  })

  it('filters by status query param', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })

    await GET(makeRequest('?status=PENDING'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
        }),
      })
    )
  })

  it('filters by plannedVisitDate with case-insensitive contains', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })

    await GET(makeRequest('?plannedVisitDate=2024-01'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          plannedVisitDate: {
            contains: '2024-01',
            mode: 'insensitive',
          },
        }),
      })
    )
  })

  it('filters by businessPartner with case-insensitive contains', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })

    await GET(makeRequest('?businessPartner=acme'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          businessPartner: {
            contains: 'acme',
            mode: 'insensitive',
          },
        }),
      })
    )
  })

  it('combines multiple filters correctly', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    await GET(makeRequest('?status=PENDING&businessPartner=acme'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: mockRegularUser.id,
          status: 'PENDING',
          businessPartner: {
            contains: 'acme',
            mode: 'insensitive',
          },
        }),
      })
    )
  })

  it('paginates correctly (page 1 skips 0, page 2 skips 10)', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })

    await GET(makeRequest('?page=2'))

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    )
  })

  it('returns total and data in response', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })
    mockFindMany.mockResolvedValue([mockPendingVisit])
    mockCount.mockResolvedValue(1)

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(1)
    expect(body.data).toHaveLength(1)
  })

  it('returns 400 when an error is thrown', async () => {
    mockGetUser.mockRejectedValue(new Error('DB error'))

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Failed to fetch visits')
  })
})
