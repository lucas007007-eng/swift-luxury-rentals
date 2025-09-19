import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// PATCH - Update support ticket status/priority
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, priority } = body
    const ticketId = params.id

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    // Update ticket
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        updatedAt: new Date()
      },
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    })

    // Trigger cache invalidation for real-time updates
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/cache/invalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'support_ticket_update', ticketId })
      })
    } catch (e) {
      console.log('Cache invalidation failed:', e)
    }

    return NextResponse.json({ ticket: updatedTicket })
  } catch (error) {
    console.error('Support ticket update error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}
