export interface ChangePasswordParams {
  currentPassword: string
  newPassword: string
  repeatedNewPassword: string
}

export const changePassword = async ({
  currentPassword,
  newPassword,
  repeatedNewPassword,
}: ChangePasswordParams) => {
  const response = await fetch('/api/auth/change-password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      repeatedNewPassword,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to change password')
  }

  return response.json()
}

export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/me')

  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }

  return response.json()
}
