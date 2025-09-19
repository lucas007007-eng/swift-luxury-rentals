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

    // Temporary: Return success without database operations until Prisma client is updated
    console.log('Support message received:', { ticketId, message, fromType })
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      fromType,
      message,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('Support message creation error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
