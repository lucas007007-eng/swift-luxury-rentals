import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const owners = await (prisma as any).owner.findMany({ select: { id: true, email: true, name: true } })
    await prisma.$disconnect()
    return NextResponse.json(owners)
  } catch (e) {
    console.error('Agents list error', e)
    return NextResponse.json([])
  }
}


