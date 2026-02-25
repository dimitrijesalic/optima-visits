import { PATCH } from '@/src/app/api/auth/change-password/route'
import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { mockRegularUser } from '../../helpers/fixtures'
import { createRequest } from '../../helpers/request'

jest.mock('@/src/lib/get-user-from-session', () => ({
  getUserFromSession: jest.fn(),
}))
jest.mock('@/src/lib/prisma', () => ({
  __esModule: true,
  default: { user: { update: jest.fn() } },
}))
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

const mockGetUser = getUserFromSession as jest.Mock
const mockUpdate = prisma.user.update as jest.Mock
const mockCompare = bcrypt.compare as unknown as jest.Mock
const mockHash = bcrypt.hash as unknown as jest.Mock

describe('PATCH /api/auth/change-password', () => {
  it('returns 401 when getUserFromSession returns error', async () => {
    mockGetUser.mockResolvedValue({
      user: null,
      error: { message: 'Unauthorized', status: 401 },
    })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword: 'a', newPassword: 'b', repeatedNewPassword: 'b' },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 401 when user is null without error', async () => {
    mockGetUser.mockResolvedValue({ user: null })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword: 'a', newPassword: 'b', repeatedNewPassword: 'b' },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  it('returns 400 when currentPassword is missing', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: { newPassword: 'new123', repeatedNewPassword: 'new123' },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Missing current or new password')
  })

  it('returns 400 when newPassword is missing', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword: 'old123', repeatedNewPassword: 'new123' },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Missing current or new password')
  })

  it('returns 400 when repeatedNewPassword is missing', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: { currentPassword: 'old123', newPassword: 'new123' },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Missing current or new password')
  })

  it('returns 400 when passwords do not match', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: 'old123',
        newPassword: 'new123',
        repeatedNewPassword: 'different456',
      },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.message).toBe('Passwords mismatch')
  })

  it('returns 401 when current password is incorrect', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockCompare.mockResolvedValue(false)

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: 'wrongpassword',
        newPassword: 'new123',
        repeatedNewPassword: 'new123',
      },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.message).toBe('Current password is incorrect')
  })

  it('updates password successfully', async () => {
    mockGetUser.mockResolvedValue({ user: mockRegularUser })
    mockCompare.mockResolvedValue(true)
    mockHash.mockResolvedValue('$2a$10$newhashedpassword')
    mockUpdate.mockResolvedValue({})

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: 'correctpassword',
        newPassword: 'newpassword123',
        repeatedNewPassword: 'newpassword123',
      },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.message).toBe('Password updated successfully')
    expect(mockHash).toHaveBeenCalledWith('newpassword123', 10)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockRegularUser.id },
      data: expect.objectContaining({
        password: '$2a$10$newhashedpassword',
        isPasswordChanged: true,
        updatedAt: expect.any(Date),
      }),
    })
  })

  it('returns 400 when an unexpected error occurs', async () => {
    mockGetUser.mockRejectedValue(new Error('DB error'))

    const req = createRequest('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: 'a',
        newPassword: 'b',
        repeatedNewPassword: 'b',
      },
    })

    const response = await PATCH(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Failed to update password')
  })
})
