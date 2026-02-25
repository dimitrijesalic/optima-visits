import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { mockAdminUser } from '../helpers/fixtures'

jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: { user: { findFirst: jest.fn() } },
}))
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Capture the NextAuth config to test authorize and callbacks
let capturedConfig: any
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn((config: any) => {
    capturedConfig = config
    return {
      handlers: {},
      auth: jest.fn(),
      signIn: jest.fn(),
      signOut: jest.fn(),
    }
  }),
}))
jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn((config: any) => config),
}))
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(),
}))

// Import auth.ts to trigger NextAuth() call and capture config
require('@/auth')

const mockFindFirst = prisma.user.findFirst as jest.Mock
const mockCompare = bcrypt.compare as jest.Mock

describe('auth.ts', () => {
  let authorize: (credentials: any) => Promise<any>

  beforeAll(() => {
    authorize = capturedConfig.providers[0].authorize
  })

  describe('authorize', () => {
    it('throws when email is missing', async () => {
      await expect(
        authorize({ password: 'test123' })
      ).rejects.toThrow('Email adresa ili lozinka nisu ispravni.')
    })

    it('throws when password is missing', async () => {
      await expect(
        authorize({ email: 'test@test.com' })
      ).rejects.toThrow('Email adresa ili lozinka nisu ispravni.')
    })

    it('throws when user not found in DB', async () => {
      mockFindFirst.mockResolvedValue(null)

      await expect(
        authorize({ email: 'notfound@test.com', password: 'test123' })
      ).rejects.toThrow('Email adresa ili lozinka nisu ispravni.')

      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { email: 'notfound@test.com' },
      })
    })

    it('throws when password does not match', async () => {
      mockFindFirst.mockResolvedValue(mockAdminUser)
      mockCompare.mockResolvedValue(false)

      await expect(
        authorize({ email: mockAdminUser.email, password: 'wrongpassword' })
      ).rejects.toThrow('Email adresa ili lozinka nisu ispravni.')

      expect(mockCompare).toHaveBeenCalledWith(
        'wrongpassword',
        mockAdminUser.password
      )
    })

    it('returns user id and email on valid credentials', async () => {
      mockFindFirst.mockResolvedValue(mockAdminUser)
      mockCompare.mockResolvedValue(true)

      const result = await authorize({
        email: mockAdminUser.email,
        password: 'correctpassword',
      })

      expect(result).toEqual({
        id: mockAdminUser.id,
        email: mockAdminUser.email,
      })
    })
  })

  describe('callbacks', () => {
    it('jwt callback sets token.email from user', async () => {
      const token = { email: '' }
      const user = { email: 'test@test.com' }

      const result = await capturedConfig.callbacks.jwt({ token, user })

      expect(result.email).toBe('test@test.com')
    })

    it('session callback sets session.user.email from token', async () => {
      const token = { email: 'test@test.com' }
      const session = { user: { email: '' } }

      const result = await capturedConfig.callbacks.session({ token, session })

      expect(result.user.email).toBe('test@test.com')
    })
  })
})
