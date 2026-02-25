import { NextResponse } from 'next/server'

import { getUserFromSession } from '@/src/lib/get-user-from-session'
import prisma from '@/src/lib/prisma'

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)

    const statusFilter = searchParams.get('status')
    const plannedVisitDateFilter = searchParams.get('plannedVisitDate')
    const businessPartnerFilter = searchParams.get('businessPartner')
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const pageSize = 10
    const skip = (page - 1) * pageSize

    const whereClause: any = {}

    // Regular users can only see their own visits
    if (user.role !== 'ADMIN') {
      whereClause.userId = user.id
    }

    if (statusFilter) {
      whereClause.status = statusFilter
    }

    if (plannedVisitDateFilter) {
      whereClause.plannedVisitDate = {
        contains: plannedVisitDateFilter,
        mode: 'insensitive',
      }
    }

    if (businessPartnerFilter) {
      whereClause.businessPartner = {
        contains: businessPartnerFilter,
        mode: 'insensitive',
      }
    }

    const visits = await prisma.visit.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: pageSize,
    })

    const total = await prisma.visit.count({ where: whereClause })

    const response = {
      total,
      data: visits,
    }

    return NextResponse.json(response)
  } catch (error: unknown) {
    console.error('Error fetching visits:', error)

    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 400 }
    )
  }
}
