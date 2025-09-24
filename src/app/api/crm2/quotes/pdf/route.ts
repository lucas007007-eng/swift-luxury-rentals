import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(()=> ({}))
    const dealId = String(b.dealId||'').trim()
    if (!dealId) return NextResponse.json({ ok:false, error:'dealId-required' }, { status:400 })
    const d = await prisma.deal.findUnique({ where: { id: dealId } })
    if (!d) return NextResponse.json({ ok:false, error:'deal-not-found' }, { status:404 })
    const lead = await prisma.lead.findUnique({ where: { id: d.leadId } })

    // Derive numbers
    const termMonths = Number(d.termMonths||0)
    const monthly = Math.round(Number(d.monthlyRateCents||0)/100)
    const deposit = Math.round(Number(d.depositCents||0)/100)
    const moveIn = Math.round(Number(d.moveInFeeCents||0)/100)
    const contractValue = Math.max(0, monthly*termMonths + moveIn)

    // File paths
    const outDirPublic = path.join(process.cwd(), 'public', 'quotes')
    const outDirTmp = path.join('/tmp', 'quotes')
    let outPath = path.join(outDirPublic, `${dealId}.pdf`)
    try { fs.mkdirSync(outDirPublic, { recursive: true }) } catch {}

    // Create PDF (simple brand style)
    const mod: any = await import('pdf-lib')
    const { PDFDocument, StandardFonts, rgb } = mod
    const pdf = await PDFDocument.create()
    const page = pdf.addPage([595, 842])
    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont((StandardFonts as any).HelveticaBold || StandardFonts.Helvetica)

    const drawText = (t: string, x: number, y: number, size=12, f=font) => page.drawText(String(t), { x, y, size, font: f, color: rgb(0,0,0) })

    // Header
    drawText('Swift Luxury — Quote', 48, 800, 18, bold)
    drawText(new Date().toISOString().slice(0,10), 480, 800, 10)
    drawText(`Lead: ${lead?.name || lead?.email || 'Client'}`, 48, 780, 12)
    if (lead?.email) drawText(`Email: ${lead.email}`, 48, 765, 12)
    if (lead?.phone) drawText(`Phone: ${lead.phone}`, 48, 750, 12)

    // Details
    let y = 710
    drawText('Offer Details', 48, y, 14, bold); y -= 18
    drawText(`City: ${d.city || '—'}`, 48, y); y -= 16
    drawText(`Property: ${d.propertyExtId || '—'}`, 48, y); y -= 16
    drawText(`Term: ${termMonths} month(s)`, 48, y); y -= 16
    drawText(`Monthly rent: € ${monthly.toLocaleString('de-DE')}`, 48, y); y -= 16
    drawText(`Move-in fee: € ${moveIn.toLocaleString('de-DE')}`, 48, y); y -= 16
    drawText(`Deposit: € ${deposit.toLocaleString('de-DE')}`, 48, y); y -= 24
    drawText(`Total contract value (rent x months + move-in): € ${contractValue.toLocaleString('de-DE')}`, 48, y, 12, bold)
    y -= 30

    drawText('Notes:', 48, y, 12, bold); y -= 16
    drawText('• Prices are in EUR. Deposit due within 72 hours of acceptance.', 60, y, 10); y -= 14
    drawText('• This quote is valid for 7 days unless otherwise stated.', 60, y, 10); y -= 14

    // Save
    let bytesForDataUrl: Uint8Array | null = null
    try {
      const bytes = await pdf.save()
      bytesForDataUrl = bytes
      fs.writeFileSync(outPath, bytes)
    } catch {
      try {
        fs.mkdirSync(outDirTmp, { recursive: true });
        outPath = path.join(outDirTmp, `${dealId}.pdf`)
        if (bytesForDataUrl) fs.writeFileSync(outPath, bytesForDataUrl)
      } catch {}
    }
    const url = `/quotes/${dealId}.pdf`
    // Return also dataUrl for immediate open
    let dataUrl: string | undefined
    try { if (bytesForDataUrl) dataUrl = `data:application/pdf;base64,${Buffer.from(bytesForDataUrl).toString('base64')}` } catch {}
    return NextResponse.json({ ok:true, url, dataUrl })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e?.message||e) }, { status:500 })
  }
}


