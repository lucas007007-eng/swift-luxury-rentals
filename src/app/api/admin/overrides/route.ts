import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'admin-overrides.json')

async function readOverrides() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    return raw ? JSON.parse(raw) : {}
  } catch (e: any) {
    if (e.code === 'ENOENT') return {}
    throw e
  }
}

async function writeOverrides(data: any) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export async function GET() {
  const data = await readOverrides()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=>null)
  if (!body) return NextResponse.json({ message: 'Invalid body' }, { status: 400 })
  const current = await readOverrides()
  const merged = { ...current, ...body }
  await writeOverrides(merged)
  return NextResponse.json({ ok: true })
}


