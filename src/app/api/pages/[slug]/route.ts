import { NextResponse } from 'next/server'
import { getPage } from '@/lib/pagesStore'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    const page = await getPage(params.slug)
    if (!page) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json({ page })
  } catch (e) {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}


