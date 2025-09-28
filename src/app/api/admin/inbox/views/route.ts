import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const rows = await (prisma as any).savedView.findMany({ orderBy: { updatedAt: 'desc' } })
    await prisma.$disconnect()
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const row = await (prisma as any).savedView.create({ data: body })
    await prisma.$disconnect()
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await (prisma as any).savedView.delete({ where: { id } })
    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}


