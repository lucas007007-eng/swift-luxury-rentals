import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function groupBy<T>(rows: T[], key: (r:T)=>string) {
  const map: Record<string, T[]> = {}
  for (const r of rows) { const k = key(r); (map[k] ||= []).push(r) }
  return map
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const dry = url.searchParams.get('dry') === '1'
  try {
    const now = new Date(); const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
    const due = await prisma.activity.findMany({
      where: {
        OR: [
          { AND: [{ dueAt: { gte: todayStart, lt: new Date(todayStart.getTime()+24*60*60*1000) } }, { completedAt: null }] },
          { AND: [{ dueAt: { lt: todayStart } }, { completedAt: null }] }
        ]
      },
      orderBy: [{ dueAt: 'asc' }],
      include: { lead: true }
    })

    // Group by owner (fallback to 'ops@swiftluxury.local')
    const buckets = groupBy(due, (a:any)=> (a.lead?.owner || 'ops@swiftluxury.local'))
    const results: any[] = []
    for (const owner in buckets) {
      const items = buckets[owner]
      const html = `
        <div style="font-family:Inter,Arial,sans-serif;color:#111">
          <h2>CRM2 Daily Reminders</h2>
          <p>Due Today / Overdue activities</p>
          <ul>
            ${items.map(a=> `<li><b>${a.type}</b> • ${a.content} — Lead: ${a.lead?.name||''} (${a.lead?.email||''}) — Due: ${a.dueAt ? new Date(a.dueAt).toLocaleDateString() : ''}</li>`).join('')}
          </ul>
        </div>`
      const subject = `CRM2 Reminders (${items.length})`
      const to = owner
      if (dry) {
        console.log('[DIGEST:DRY]', { to, subject, count: items.length })
        results.push({ to, subject, count: items.length, dry: true })
      } else {
        const r = await sendMail({ to, subject, html })
        results.push({ to, subject, count: items.length, ok: r.ok })
      }
    }
    return NextResponse.json({ ok:true, data: results })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'digest-failed' }, { status: 500 })
  }
}


