import { PATCH } from '@/src/app/api/visits/[id]/route'
import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'
import {
  mockAdminUser,
  mockRegularUser,
  mockPendingVisit,
  mockDoneVisit,
} from '../../helpers/fixtures'
import { createRequest } from '../../helpers/request'

jest.mock('@/src/lib/get-user-from-session', () => ({
  getUserFromSession: jest.fn(),
}))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: {
    visit: { findUnique: jest.fn(), update: jest.fn() },
  },
}))

const mockGetUser = getUserFromSession as jest.Mock
const mockFindUnique = prisma.visit.findUnique as jest.Mock
const mockUpdate = prisma.visit.update as jest.Mock

function callPatch(id: string, body: unknown) {
  const req = createRequest(`/api/visits/${id}`, {
    method: 'PATCH',
    body,
  })
  return PATCH(req, { params: Promise.resolve({ id }) })
}

describe('PATCH /api/visits/[id]', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-06-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns 401 when getUserFromSession returns error', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })

    const response = await callPatch('some-id', { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 401 when user is null', async () => {
    mockGetUser.mockResolvedValue({ user: null })

    const response = await callPatch('some-id', { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 404 when visit not found', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })
    mockFindUnique.mockResolvedValue(null)

    const response = await callPatch('nonexistent-id', { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.message).toBe('Visit not found')
  })

  it('returns 403 when USER tries to update another users visit', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue({
      ...mockPendingVisit,
      userId: 'different-user-id',
    })

    const response = await callPatch(mockPendingVisit.id, { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.message).toBe('Forbidden')
  })

  it('returns 400 when USER tries to update non-PENDING visit', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue({
      ...mockDoneVisit,
      userId: mockRegularUser.id,
    })

    const response = await callPatch(mockDoneVisit.id, { note: 'update' })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe(
      'Only visits with PENDING status can be updated'
    )
  })

  it('returns 400 when USER tries to update visit with future date', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue({
      ...mockPendingVisit,
      userId: mockRegularUser.id,
      plannedVisitDate: '2025-12-31',
    })

    const response = await callPatch(mockPendingVisit.id, { note: 'update' })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe(
      'Cannot update visit with a planned date in the future'
    )
  })

  it('allows USER to update own PENDING visit with past date', async () => {
    const pastVisit = {
      ...mockPendingVisit,
      userId: mockRegularUser.id,
      plannedVisitDate: '2025-01-10',
    }
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue(pastVisit)
    mockUpdate.mockResolvedValue({ ...pastVisit, status: 'DONE' })

    const response = await callPatch(mockPendingVisit.id, { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('allows USER to update visit when plannedVisitDate is null', async () => {
    const visitNoDate = {
      ...mockPendingVisit,
      userId: mockRegularUser.id,
      plannedVisitDate: null,
    }
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue(visitNoDate)
    mockUpdate.mockResolvedValue({ ...visitNoDate, note: 'updated' })

    const response = await callPatch(mockPendingVisit.id, { note: 'updated' })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('ADMIN can update any visit regardless of status', async () => {
    mockGetUser.mockResolvedValue({ user: mockAdminUser })
    mockFindUnique.mockResolvedValue(mockDoneVisit)
    mockUpdate.mockResolvedValue({ ...mockDoneVisit, note: 'admin edit' })

    const response = await callPatch(mockDoneVisit.id, { note: 'admin edit' })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('ADMIN can update visit with future date', async () => {
    const futureVisit = {
      ...mockPendingVisit,
      plannedVisitDate: '2099-12-31',
    }
    mockGetUser.mockResolvedValue({ user: mockAdminUser })
    mockFindUnique.mockResolvedValue(futureVisit)
    mockUpdate.mockResolvedValue({ ...futureVisit, note: 'admin future' })

    const response = await callPatch(mockPendingVisit.id, {
      note: 'admin future',
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('only includes provided fields in update data', async () => {
    const pastVisit = {
      ...mockPendingVisit,
      userId: mockRegularUser.id,
      plannedVisitDate: '2025-01-10',
    }
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockFindUnique.mockResolvedValue(pastVisit)
    mockUpdate.mockResolvedValue({ ...pastVisit, status: 'DONE', note: 'test' })

    await callPatch(mockPendingVisit.id, { status: 'DONE', note: 'test' })

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockPendingVisit.id },
      data: {
        status: 'DONE',
        note: 'test',
        updatedAt: expect.any(Date),
      },
      include: expect.any(Object),
    })
  })

  it('returns 400 when an error is thrown', async () => {
    mockGetUser.mockRejectedValue(new Error('DB error'))

    const response = await callPatch('some-id', { status: 'DONE' })
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Failed to update visit')
  })
})
