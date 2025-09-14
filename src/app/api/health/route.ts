import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { readAndValidateEnv } from '@/lib/env'

export async function GET() {
  try {
    // Validate env (non-fatal in dev)
    try { readAndValidateEnv() } catch (e) { /* ignore in dev runtime */ }

    // Simple DB ping: run a lightweight query
    await prisma.$queryRawUnsafe('SELECT 1')

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}
