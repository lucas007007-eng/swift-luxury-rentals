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

    // Temporary: Return mock data until Prisma client is updated
    const mockTickets = [
      {
        id: 'ticket-001',
        userId: 'user-123',
        user: { name: 'John Lenon', email: 'john.lenon@example.com' },
        subject: 'Heating issue in apartment',
        description: 'The heating system is not working properly.',
        status: 'open',
        priority: 'high',
        category: 'maintenance',
        createdAt: '2025-09-18T10:30:00Z',
        updatedAt: '2025-09-18T10:30:00Z',
        messages: [
          {
            id: 'msg-001',
            fromType: 'tenant',
            message: 'The heating system is not working properly.',
            createdAt: '2025-09-18T10:30:00Z'
          }
        ]
      }
    ]
    
    return NextResponse.json({ tickets: mockTickets })
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

    // Temporary: Return mock success until Prisma client is updated
    console.log('Support ticket creation:', { subject, description, category, priority })
    
    const ticket = {
      id: `ticket-${Date.now()}`,
      userId: 'user-temp',
      user: { name: session.user.name || 'User', email: session.user.email },
      subject,
      description,
      category,
      priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          fromType: 'tenant',
          message: description,
          createdAt: new Date().toISOString()
        }
      ]
    }

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Support ticket creation error:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
