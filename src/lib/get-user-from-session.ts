import type { User } from '@prisma/client'

import { auth } from '@/auth'
import prisma from '@/src/lib/prisma'

export const getUserFromSession = async (): Promise<{
  user: User | null
  error?: { message: string; status: number }
}> => {
  const session = await auth()

  if (!session || !session.user || !session.user.email) {
    return { error: { message: 'Unauthorized', status: 401 }, user: null }
  }

  const { email } = session.user

  const user = await prisma.user.findFirst({ where: { email } })

  return { user }
}
