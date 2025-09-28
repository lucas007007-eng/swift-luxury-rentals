import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const b = await req.json().catch(()=> ({}))
  const to = String(b.to||'').trim()
  const link = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/crm2/quotes/accept?leadId=${encodeURIComponent(b.leadId||'')}&dealId=${encodeURIComponent(b.dealId||'')}`
  if (!to) return NextResponse.json({ ok:false, error:'to-required' }, { status:400 })
  const subject = 'Your Phantom Properties Quote'
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#111">
      <h2>Your Quote</h2>
      <p>City: ${b.city||'—'} • Term: ${b.termMonths||1} months • Monthly: €${(Number(b.monthlyRateCents||0)/100).toLocaleString('de-DE')}</p>
      <p>Deposit €${(Number(b.depositCents||0)/100).toLocaleString('de-DE')} • Move-in €${(Number(b.moveInFeeCents||0)/100).toLocaleString('de-DE')}</p>
      <p><a href="${link}">Accept Quote</a></p>
    </div>`
  const r = await sendMail({ to, subject, html })
  return NextResponse.json({ ok: r.ok })
}


