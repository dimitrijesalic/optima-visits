import { getUserFromSession } from '@/src/lib/get-user-from-session'
import { auth } from '@/auth'
import prisma from '@/src/lib/prisma'
import { mockAdminUser } from '../helpers/fixtures'

jest.mock('@/auth', () => ({ auth: jest.fn() }))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: { user: { findFirst: jest.fn() } },
}))

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockFindFirst = prisma.user.findFirst as jest.Mock

describe('getUserFromSession', () => {
  it('returns 401 error when auth() returns null', async () => {
    mockAuth.mockResolvedValue(null as any)

    const result = await getUserFromSession()

    expect(result).toEqual({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })
  })

  it('returns 401 error when session has no user', async () => {
    mockAuth.mockResolvedValue({ user: undefined } as any)

    const result = await getUserFromSession()

    expect(result).toEqual({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })
  })

  it('returns 401 error when session user has no email', async () => {
    mockAuth.mockResolvedValue({ user: { email: null } } as any)

    const result = await getUserFromSession()

    expect(result).toEqual({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })
  })

  it('returns null user when email not found in DB', async () => {
    mockAuth.mockResolvedValue({
      user: { email: 'nonexistent@test.com' },
    } as any)
    mockFindFirst.mockResolvedValue(null)

    const result = await getUserFromSession()

    expect(result).toEqual({ user: null })
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { email: 'nonexistent@test.com' },
    })
  })

  it('returns user on success', async () => {
    mockAuth.mockResolvedValue({
      user: { email: mockAdminUser.email },
    } as any)
    mockFindFirst.mockResolvedValue(mockAdminUser)

    const result = await getUserFromSession()

    expect(result).toEqual({ user: mockAdminUser })
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { email: mockAdminUser.email },
    })
  })
})
