import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  const leadId = String(url.searchParams.get('leadId')||'')
  const dealId = String(url.searchParams.get('dealId')||'')
  if (!leadId) return NextResponse.redirect(new URL('/crm2?accept=missing', url.origin))
  try {
    await prisma.lead.update({ where: { id: leadId }, data: { stage: 'signed', updatedAt: new Date() } })
  } catch {}
  return NextResponse.redirect(new URL('/crm2?accept=ok', url.origin))
}


