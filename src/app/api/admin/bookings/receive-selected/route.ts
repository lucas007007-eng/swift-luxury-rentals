import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let ids: string[] = []
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(()=>({})) as any
      const arr = body?.paymentIds || body?.ids || []
      ids = Array.isArray(arr) ? arr.map((x:any)=> String(x)) : []
    } else {
      const form = await req.formData().catch(()=>null)
      if (form) {
        const all = form.getAll('paymentId').concat(form.getAll('paymentIds')).concat(form.getAll('ids'))
        ids = all.map((v:any)=> String(v)).filter(Boolean)
      }
    }
    if (!ids || ids.length === 0) return NextResponse.json({ message: 'No paymentIds provided' }, { status: 400 })

    const now = new Date()
    await prisma.payment.updateMany({ where: { id: { in: ids } }, data: { status: 'received', receivedAt: now } })

    // If submitted via form, redirect back to bookings page
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      return NextResponse.redirect(new URL('/admin/bookings', req.url))
    }
    return NextResponse.json({ ok: true, count: ids.length })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}



