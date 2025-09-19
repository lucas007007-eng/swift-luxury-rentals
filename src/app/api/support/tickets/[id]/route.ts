import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

// PATCH - Update ticket status/priority
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticketId = params.id
    const body = await request.json()
    const { status, priority } = body as { status?: string; priority?: string }

    if (!status && !priority) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: true,
      },
    })

    return NextResponse.json({ ticket: updated })
  } catch (error) {
    console.error('Support ticket update error:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }
}


