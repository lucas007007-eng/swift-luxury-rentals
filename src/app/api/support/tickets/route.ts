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

    if (isAdmin) {
      // Admin: Get all tickets
      const tickets = await prisma.supportTicket.findMany({
        include: {
          user: { select: { name: true, email: true } },
          messages: { orderBy: { createdAt: 'asc' } }
        },
        orderBy: { updatedAt: 'desc' }
      })
      return NextResponse.json({ tickets })
    } else {
      // User: Get only their tickets
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

      const tickets = await prisma.supportTicket.findMany({
        where: { userId: user.id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } }
        },
        orderBy: { updatedAt: 'desc' }
      })
      return NextResponse.json({ tickets })
    }
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

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        description,
        category,
        priority,
        messages: {
          create: {
            fromType: 'tenant',
            message: description
          }
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        messages: true
      }
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
