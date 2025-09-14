import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'admin-overrides.json')

async function readOverrides() {
  try {
    // Read from DB first
    const dbOverrides = await prisma.adminOverride.findMany()
    const dbData: Record<string, any> = {}
    for (const o of dbOverrides) {
      dbData[o.propertyExtId] = o.data
    }

    // Fallback to JSON file
    let jsonData: Record<string, any> = {}
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf8')
      jsonData = raw ? JSON.parse(raw) : {}
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e
    }

    // Merge: DB takes precedence
    return { ...jsonData, ...dbData }
  } catch (e: any) {
    console.error('Error reading overrides:', e)
    return {}
  }
}

async function writeOverrides(data: any) {
  try {
    // Write to both DB and JSON for backward compatibility
    for (const [propertyExtId, propertyData] of Object.entries(data)) {
      if (propertyData && typeof propertyData === 'object') {
        await prisma.adminOverride.upsert({
          where: { propertyExtId },
          update: { data: propertyData },
          create: { propertyExtId, data: propertyData },
        })
      }
    }

    // Also write to JSON file as backup
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (e: any) {
    console.error('Error writing overrides:', e)
    throw e
  }
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


