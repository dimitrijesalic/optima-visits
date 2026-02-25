import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await getUserFromSession()

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      )
    }

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword, repeatedNewPassword } =
      await req.json()

    if (!currentPassword || !newPassword || !repeatedNewPassword) {
      return NextResponse.json(
        { message: 'Missing current or new password' },
        { status: 400 }
      )
    }

    if (newPassword !== repeatedNewPassword) {
      return NextResponse.json(
        { message: 'Passwords mismatch' },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isPasswordChanged: true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Password updated successfully',
    })
  } catch (error: unknown) {
    console.error('Error updating password:', error)

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 400 }
    )
  }
}
