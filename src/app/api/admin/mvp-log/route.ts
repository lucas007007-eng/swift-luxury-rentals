import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'MVP_LOG.md')
    const content = await fs.readFile(filePath, 'utf8').catch(() => '')
    return NextResponse.json({ ok: true, content })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 })
  }
}
