import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({})) as any
    const id = String(body?.id || '')
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    await prisma.payment.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


