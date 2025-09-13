import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }
  const form = await req.formData()
  const file = form.get('file') as File | null
  const filename = (form.get('filename') as string) || file?.name || 'upload'
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  const extOk = /\.(png|jpe?g)$/i.test(filename)
  if (!extOk) {
    return NextResponse.json({ error: 'Only PNG/JPG allowed' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
  const safeName = filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase()
  const destPath = path.join(uploadsDir, `${Date.now()}_${safeName}`)
  fs.writeFileSync(destPath, buffer)
  const publicUrl = `/uploads/${path.basename(destPath)}`
  return NextResponse.json({ url: publicUrl })
}


