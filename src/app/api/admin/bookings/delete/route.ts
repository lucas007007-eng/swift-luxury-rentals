import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(()=>({})) as any
    const id = String(body?.id || '')
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })
    
    // Soft delete: mark as deleted instead of removing from database
    const now = new Date()
    await prisma.booking.update({
      where: { id },
      data: { 
        deletedAt: now,
        status: 'cancelled' // Also mark as cancelled for consistency
      }
    })
    
    // Log the deletion for audit trail
    console.log(`[AUDIT] Booking ${id} soft deleted at ${now.toISOString()}`)
    
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Booking delete failed:', e)
    return NextResponse.json({ message: 'Failed to delete' }, { status: 500 })
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


