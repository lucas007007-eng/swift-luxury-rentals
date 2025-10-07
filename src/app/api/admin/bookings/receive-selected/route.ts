import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { syncBookingOperation } from '@/lib/syncTrigger'

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

    // Get the payments to preserve their original due dates as receivedAt
    const payments = await prisma.payment.findMany({ where: { id: { in: ids } }, select: { id: true, dueAt: true } })
    
    // Update each payment individually to use its dueAt as receivedAt
    for (const payment of payments) {
      await prisma.payment.update({ 
        where: { id: payment.id }, 
        data: { 
          status: 'received', 
          receivedAt: payment.dueAt || new Date() 
        } 
      })
    }

    console.log(`[PAYMENT] Approved ${ids.length} payments, setting status to 'received'`)
    
    // Trigger simplified sync across all systems
    await syncBookingOperation('confirmed', { paymentIds: ids, count: ids.length })

    // If submitted via form, redirect back to bookings page with cache busting
    if (!contentType || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const redirectUrl = new URL('/admin/bookings', req.url)
      redirectUrl.searchParams.set('_refresh', Date.now().toString()) // Cache busting
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.json({ ok: true, count: ids.length })
  } catch (e: any) {
    return NextResponse.json({ message: 'Failed', error: String(e?.message || e) }, { status: 500 })
  }
}






