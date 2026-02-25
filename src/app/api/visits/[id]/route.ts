import { NextRequest, NextResponse } from 'next/server'

import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    }

    const visit = await prisma.visit.findUnique({ where: { id } })

    if (!visit) {
      return NextResponse.json(
        { message: 'Visit not found' },
        { status: 404 }
      )
    }

    // Regular users can only update their own visits
    if (user.role !== 'ADMIN' && visit.userId !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Regular users can only update visits with status PENDING
    if (user.role !== 'ADMIN' && visit.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Only visits with PENDING status can be updated' },
        { status: 400 }
      )
    }

    // Regular users can only update visits where plannedVisitDate is NOT in the future
    if (user.role !== 'ADMIN' && visit.plannedVisitDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const visitDate = new Date(visit.plannedVisitDate)
      visitDate.setHours(0, 0, 0, 0)

      if (visitDate > today) {
        return NextResponse.json(
          {
            message:
              'Cannot update visit with a planned date in the future',
          },
          { status: 400 }
        )
      }
    }

    const body = await req.json()

    const {
      status,
      plannedTopic,
      realisedTopic,
      plannedVisitDate,
      plannedVisitTime,
      businessPartner,
      plannedVisitDuration,
      note,
      grade,
    } = body

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status !== undefined) updateData.status = status
    if (plannedTopic !== undefined) updateData.plannedTopic = plannedTopic
    if (realisedTopic !== undefined) updateData.realisedTopic = realisedTopic
    if (plannedVisitDate !== undefined)
      updateData.plannedVisitDate = plannedVisitDate
    if (plannedVisitTime !== undefined)
      updateData.plannedVisitTime = plannedVisitTime
    if (businessPartner !== undefined)
      updateData.businessPartner = businessPartner
    if (plannedVisitDuration !== undefined)
      updateData.plannedVisitDuration = plannedVisitDuration
    if (note !== undefined) updateData.note = note
    if (grade !== undefined) updateData.grade = grade

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(updatedVisit)
  } catch (error: unknown) {
    console.error('Error updating visit:', error)

    return NextResponse.json(
      { error: 'Failed to update visit' },
      { status: 400 }
    )
  }
}
