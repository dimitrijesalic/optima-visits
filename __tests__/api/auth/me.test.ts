import { GET } from '@/src/app/api/auth/me/route'
import { auth } from '@/auth'
import prisma from '@/src/lib/prisma'
import { mockAdminUser } from '../../helpers/fixtures'

jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn() } },
}))

const mockAuth = auth as jest.Mock
const mockFindUnique = prisma.user.findUnique as jest.Mock

describe('GET /api/auth/me', () => {
  it('returns 401 when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 401 when session user has no email', async () => {
    mockAuth.mockResolvedValue({ user: { email: null } })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when user not found in DB', async () => {
    mockAuth.mockResolvedValue({ user: { email: 'ghost@test.com' } })
    mockFindUnique.mockResolvedValue(null)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Invalid user')
  })

  it('returns 200 with user profile on success', async () => {
    const { password, ...userWithoutPassword } = mockAdminUser
    mockAuth.mockResolvedValue({ user: { email: mockAdminUser.email } })
    mockFindUnique.mockResolvedValue(userWithoutPassword)

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.email).toBe(mockAdminUser.email)
    expect(body.firstName).toBe(mockAdminUser.firstName)
    expect(body.role).toBe(mockAdminUser.role)
    expect(body).not.toHaveProperty('password')
  })

  it('returns 500 when an unexpected error occurs', async () => {
    mockAuth.mockRejectedValue(new Error('DB connection failed'))

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Something went wrong')
  })
})
