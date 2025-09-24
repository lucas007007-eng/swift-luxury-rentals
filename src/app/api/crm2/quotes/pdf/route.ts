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

    // Spy theme colors
    const bg = rgb(0.05, 0.05, 0.07)             // deep metallic black
    const pane = rgb(0.08, 0.08, 0.1)            // card background
    const silver = rgb(0.85, 0.86, 0.9)          // premium silver text
    const silverDim = rgb(0.72, 0.74, 0.78)
    const accent = rgb(0.0, 0.75, 0.55)          // emerald accent

    const font = await pdf.embedFont(StandardFonts.Helvetica)
    const bold = await pdf.embedFont((StandardFonts as any).HelveticaBold || StandardFonts.Helvetica)

    const drawText = (t: string, x: number, y: number, size=12, f=font, color=silver) => page.drawText(String(t), { x, y, size, font: f, color })

    // Full background
    page.drawRectangle({ x: 0, y: 0, width: page.getWidth(), height: page.getHeight(), color: bg })
    // Subtle metallic frame
    page.drawRectangle({ x: 10, y: 10, width: page.getWidth()-20, height: page.getHeight()-20, color: undefined, borderColor: silverDim, borderWidth: 1 })
    // Header bar
    page.drawRectangle({ x: 0, y: 800, width: page.getWidth(), height: 42, color: pane })
    // Left accent bar
    page.drawRectangle({ x: 0, y: 0, width: 4, height: page.getHeight(), color: accent })
    // Watermark (diagonal, light silver)
    try {
      const wm = 'SWIFT LUXURY'
      page.drawText(wm, { x: 120, y: 320, size: 64, font: bold, color: rgb(0.22,0.24,0.28), rotate: { type: 'degrees', angle: 30 }, opacity: 0.08 })
    } catch {}

    // Header text
    drawText('Swift Luxury — Quote', 48, 812, 18, bold, silver)
    const todayStr = new Date().toISOString().slice(0,10)
    drawText(todayStr, page.getWidth()-140, 812, 10, font, silverDim)

    // Metadata block (top-right)
    const metaX = page.getWidth()-240
    const metaY = 750
    page.drawRectangle({ x: metaX, y: metaY, width: 200, height: 70, color: pane })
    const quoteId = `Q-${dealId.slice(0,8).toUpperCase()}`
    const expiry = (() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,10) })()
    drawText('Quote ID', metaX+10, metaY+52, 10, bold, silverDim)
    drawText(quoteId, metaX+90, metaY+52, 10, font, silver)
    drawText('Date', metaX+10, metaY+36, 10, bold, silverDim)
    drawText(todayStr, metaX+90, metaY+36, 10, font, silver)
    drawText('Expires', metaX+10, metaY+20, 10, bold, silverDim)
    drawText(expiry, metaX+90, metaY+20, 10, font, silver)
    // Placeholders for future mapping
    drawText('Ref:', metaX+10, metaY+4, 9, bold, silverDim)
    drawText('TBD', metaX+90, metaY+4, 9, font, silverDim)

    // Lead summary card (lowered for better balance)
    page.drawRectangle({ x: 40, y: 700, width: page.getWidth()-80, height: 56, color: pane })
    drawText(`Lead: ${lead?.name || lead?.email || 'Client'}`, 48, 728, 12, bold)
    if (lead?.email) drawText(`Email: ${lead.email}`, 260, 728, 11)
    if (lead?.phone) drawText(`Phone: ${lead.phone}`, 440, 728, 11)

    // Section: Offer Details (spy-tech card)
    let y = 620
    // Narrow left column to avoid collision with right-side image panel
    const leftPaneWidth = page.getWidth()-300
    page.drawRectangle({ x: 40, y: 500, width: leftPaneWidth, height: 220, color: pane })
    drawText('Offer Details', 48, y, 14, bold, silver); y -= 20
    drawText(`City: ${d.city || '—'}`, 48, y, 12, font, silverDim); y -= 18
    drawText(`Property: ${d.propertyExtId || '—'}`, 48, y, 12, font, silverDim); y -= 18
    drawText(`Term: ${termMonths} month(s)`, 48, y, 12, font, silverDim); y -= 18
    drawText(`Monthly rent: € ${monthly.toLocaleString('de-DE')}`, 48, y, 12, font, silver); y -= 18
    drawText(`Move-in fee: € ${moveIn.toLocaleString('de-DE')}`, 48, y, 12, font, silver); y -= 18
    drawText(`Deposit: € ${deposit.toLocaleString('de-DE')}`, 48, y, 12, font, silver); y -= 26
    drawText(`Total contract value (rent x months + move-in): € ${contractValue.toLocaleString('de-DE')}`, 48, y, 12, bold, accent)
    y -= 34

    // Right panel: Property image (or placeholder)
    try {
      const px = page.getWidth()-240
      const py = 510
      const pw = 180
      const ph = 120
      page.drawRectangle({ x: px, y: py, width: pw, height: ph, color: pane })
      // Attempt to load first property image from Prisma
      try {
        const prop = await prisma.property.findFirst({ where: { OR: [{ extId: d.propertyExtId || '' }, { id: d.propertyExtId || '' }] }, include: { images: { orderBy: { position: 'asc' }, take: 1 } } })
        const url = (prop?.images?.[0]?.url || '').trim()
        if (url) {
          const resp = await fetch(url)
          const buf = new Uint8Array(await resp.arrayBuffer())
          const img = url.toLowerCase().endsWith('.png') ? await pdf.embedPng(buf) : await pdf.embedJpg(buf)
          const dims = img.scaleToFit(pw-10, ph-10)
          page.drawImage(img, { x: px + (pw-dims.width)/2, y: py + (ph-dims.height)/2, width: dims.width, height: dims.height })
        } else {
          drawText('Property Image', px+12, py+ph/2-6, 10, font, silverDim)
        }
      } catch { drawText('Property Image', px+12, py+ph/2-6, 10, font, silverDim) }
    } catch {}

    // Price breakdown table (relocated below image to prevent overlap)
    const tblX = 48
    let ty = 440
    // background strip for readability
    page.drawRectangle({ x: 40, y: 360, width: page.getWidth()-80, height: 90, color: pane })
    drawText('Price Breakdown', tblX, ty, 12, bold, silver); ty -= 16
    const col2 = page.getWidth()-88
    const line = (label: string, value: string, isTotal=false) => {
      drawText(label, tblX, ty, 11, isTotal? bold: font, isTotal? silver: silverDim)
      const w = (isTotal? bold: font).widthOfTextAtSize(value, 11)
      page.drawText(value, { x: col2 - w, y: ty, size: 11, font: isTotal? bold: font, color: isTotal? accent: silver })
    }
    line(`Monthly × ${termMonths}`, `€ ${monthly.toLocaleString('de-DE')} × ${termMonths}`)
    ty -= 16
    line('Move-in fee', `€ ${moveIn.toLocaleString('de-DE')}`)
    ty -= 16
    line('Deposit', `€ ${deposit.toLocaleString('de-DE')}`)
    ty -= 18
    line('Total (rent × months + move-in)', `€ ${contractValue.toLocaleString('de-DE')}`, true)
    ty -= 8
    page.drawRectangle({ x: tblX, y: ty, width: col2-tblX, height: 1, color: silverDim })

    // Notes pane
    // Move notes further down to avoid overlapping the total line
    page.drawRectangle({ x: 40, y: 340, width: page.getWidth()-80, height: 70, color: pane })
    drawText('Notes', 48, 402, 12, bold, silver)
    drawText('• Prices in EUR. Deposit due within 72 hours of acceptance.', 48, 386, 10, font, silverDim)
    drawText('• Quote valid for 7 days unless otherwise stated.', 48, 372, 10, font, silverDim)

    // Signature area
    const sigTop = 220
    // Outer frame
    page.drawRectangle({ x: 40, y: sigTop-90, width: page.getWidth()-80, height: 110, color: pane })
    // Left: Swift Luxury signature line
    page.drawRectangle({ x: 60, y: sigTop, width: page.getWidth()/2 - 100, height: 1, color: silver })
    drawText('Swift Luxury — Authorized Signature', 60, sigTop-14, 10, font, silverDim)
    // Right: Client signature line
    const rightX = page.getWidth()/2 + 40
    page.drawRectangle({ x: rightX, y: sigTop, width: page.getWidth()/2 - 100, height: 1, color: silver })
    drawText('Client Signature', rightX, sigTop-14, 10, font, silverDim)
    // Dates under signatures
    drawText('Date: ____________', 60, sigTop-32, 10, font, silverDim)
    drawText('Date: ____________', rightX, sigTop-32, 10, font, silverDim)

    // Accept block with placeholder QR area
    const acceptLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/crm2/quotes/accept?leadId=${encodeURIComponent(d.leadId)}&dealId=${encodeURIComponent(d.id)}`
    page.drawRectangle({ x: page.getWidth()-260, y: 140, width: 200, height: 80, color: pane })
    drawText('Scan to Accept', page.getWidth()-250, 206, 12, bold, silver)
    page.drawRectangle({ x: page.getWidth()-120, y: 150, width: 60, height: 60, color: bg, borderColor: silverDim, borderWidth: 1 })
    drawText('(QR reserved)', page.getWidth()-118, 180, 8, font, silverDim)
    drawText(acceptLink || 'Accept URL', page.getWidth()-250, 160, 8, font, silverDim)

    // Footer
    page.drawRectangle({ x: 0, y: 28, width: page.getWidth(), height: 24, color: pane })
    drawText('Swift Luxury GmbH • Friedrichstraße 123 • 10117 Berlin • IBAN: TBD • BIC: TBD', 48, 36, 9, font, silverDim)
    const footerText = 'Page 1 of 1'
    const fw = font.widthOfTextAtSize(footerText, 9)
    page.drawText(footerText, { x: page.getWidth()-48-fw, y: 36, size: 9, font, color: silverDim })
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


