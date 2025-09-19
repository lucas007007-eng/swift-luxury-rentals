import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// GET - Fetch support tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    // Admin sees all tickets; tenant sees their own
    const tickets = await prisma.supportTicket.findMany({
      where: isAdmin
        ? undefined
        : {
            user: { email: session.user.email },
          },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Support tickets fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

// POST - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, category, priority } = body

    if (!subject || !description || !category || !priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const created = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        description,
        category,
        priority,
        status: 'open',
        messages: {
          create: {
            fromType: 'tenant',
            message: description,
          },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: true,
      },
    })

    return NextResponse.json({ ticket: created }, { status: 201 })
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
