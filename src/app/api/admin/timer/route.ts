import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get the latest timer session or create one
    let session = await prisma.timerSession.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    
    if (!session) {
      // Initialize with current accurate time (15.5h prompting + 31h coding)
      session = await prisma.timerSession.create({
        data: {
          promptingSeconds: Math.floor(15.5 * 3600), // 15.5 hours in seconds
          codingSeconds: Math.floor(31.0 * 3600),    // 31 hours in seconds
          isActive: true
        }
      })
    }
    
    return NextResponse.json({
      promptingHours: session.promptingSeconds / 3600,
      codingHours: session.codingSeconds / 3600,
      isActive: session.isActive,
      lastActivity: session.lastActivity.toISOString(),
      lastUpdate: session.updatedAt.toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { promptingSeconds, codingSeconds, isActive } = await req.json()
    
    // Update the latest session or create new one
    let session = await prisma.timerSession.findFirst({
      orderBy: { updatedAt: 'desc' }
    })
    
    if (session) {
      session = await prisma.timerSession.update({
        where: { id: session.id },
        data: {
          promptingSeconds: Math.floor(promptingSeconds),
          codingSeconds: Math.floor(codingSeconds),
          isActive,
          lastActivity: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      session = await prisma.timerSession.create({
        data: {
          promptingSeconds: Math.floor(promptingSeconds),
          codingSeconds: Math.floor(codingSeconds),
          isActive
        }
      })
    }
    
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}
