import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// POST - Send message to support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketId, message, fromType } = body

    if (!ticketId || !message || !fromType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify ticket exists and user has access
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { user: true }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check permissions
    if (fromType === 'tenant') {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (!user || ticket.userId !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    // For admin, we'd check admin permissions here

    // Create message
    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId,
        fromType,
        message
      }
    })

    // Update ticket timestamp
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('Support message creation error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
