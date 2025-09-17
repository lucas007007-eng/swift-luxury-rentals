import { NextResponse } from 'next/server'
import { getAllPages, upsertPage } from '@/lib/pagesStore'

export async function GET() {
  try {
    const pages = await getAllPages()
    return NextResponse.json({ pages })
  } catch (e) {
    return NextResponse.json({ pages: [] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { slug, input } = body || {}
    if (!slug || typeof slug !== 'string') return NextResponse.json({ message: 'slug required' }, { status: 400 })
    const updated = await upsertPage(slug, input || {})
    return NextResponse.json({ page: updated })
  } catch (e) {
    return NextResponse.json({ message: 'Failed to save' }, { status: 500 })
  }
}


