import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const lastUpdate = (global as any).__financeLastUpdate || 0
    return NextResponse.json({ lastUpdate })
  } catch (e) {
    return NextResponse.json({ lastUpdate: 0 })
  }
}
