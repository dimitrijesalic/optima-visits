import { NextResponse } from 'next/server'

import prisma from '@/src/lib/prisma'

interface VisitInput {
  email: string
  plannedTopic: string
  plannedVisitDate: string
  plannedVisitTime: string
  businessPartner: string
  plannedVisitDuration: string
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: 'Request body must be an array' },
        { status: 400 }
      )
    }

    if (body.length === 0) {
      return NextResponse.json(
        { message: 'Request body must not be empty' },
        { status: 400 }
      )
    }

    const emails = Array.from(new Set(body.map((v: VisitInput) => v.email)))

    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true },
    })

    const emailToUserId = new Map(users.map((u) => [u.email, u.id]))

    const notFound = emails.filter((e) => !emailToUserId.has(e))
    if (notFound.length > 0) {
      return NextResponse.json(
        { message: `Users not found: ${notFound.join(', ')}` },
        { status: 400 }
      )
    }

    const visits = body.map((v: VisitInput) => ({
      userId: emailToUserId.get(v.email)!,
      status: 'PENDING' as const,
      plannedTopic: v.plannedTopic,
      plannedVisitDate: v.plannedVisitDate,
      plannedVisitTime: v.plannedVisitTime,
      businessPartner: v.businessPartner,
      plannedVisitDuration: v.plannedVisitDuration,
    }))

    const result = await prisma.visit.createMany({ data: visits })

    return NextResponse.json(
      { message: `${result.count} visits created` },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error('Error importing visits:', error)

    return NextResponse.json(
      { error: 'Failed to import visits' },
      { status: 400 }
    )
  }
}
