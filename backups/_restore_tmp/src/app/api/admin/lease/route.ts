import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { cityProperties } from '@/data/cityProperties'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Booking = {
  id: string
  clientName: string
  city: string
  propertyId: string
  propertyTitle: string
  checkIn: string
  checkOut: string
  total: number
  commission?: number
  paid?: boolean
  leasePdf?: string | null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id } = body || {}
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })

    const dataPath = path.join(process.cwd(), 'src', 'data', 'bookings.json')
    let bookings: Booking[] = []
    if (fs.existsSync(dataPath)) bookings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
    let idx = bookings.findIndex(b => b.id === id)
    let b: Booking | null = idx !== -1 ? bookings[idx] : null

    // Fallback to Prisma when JSON CRM does not have this booking
    if (!b) {
      const pb = await prisma.booking.findUnique({ where: { id }, include: { user: true, property: true } })
      if (!pb) return NextResponse.json({ message: 'Not found' }, { status: 404 })
      const addr = String(pb.property?.address || '')
      const cityFromAddr = addr ? (addr.split(',').pop()?.trim() || '') : ''
      b = {
        id: pb.id,
        clientName: pb.user?.name || pb.user?.email || '—',
        city: cityFromAddr || '—',
        propertyId: pb.property?.extId || pb.propertyId,
        propertyTitle: pb.property?.title || 'Property',
        checkIn: new Date(pb.checkin).toISOString().slice(0,10),
        checkOut: new Date(pb.checkout).toISOString().slice(0,10),
        total: Math.round((Number(pb.totalCents)||0)/100),
        paid: (pb as any).payments ? ((pb as any).payments as any[]).some(p => p.purpose !== 'deposit' && p.status === 'received') : undefined,
        leasePdf: null,
      }
    }

    // Prepare lease fields (defaults; consider moving to config)
    const company = 'Swift Luxury GmbH'
    const companyRepresentative = 'Authorized Representative'
    const companyAddrStreet = 'Friedrichstraße 123'
    const companyAddrPostalCity = '10117 Berlin'
    const bankName = 'Deutsche Bank'
    const bankIban = 'DE89 3704 0044 0532 0130 00'
    const bankBic = 'DEUTDEDBBER'
    const contactEmail = 'contracts@swiftluxury.de'
    const systemInfoUrl = 'https://swiftluxury.de/system-info'
    const propertyManagementSystem = 'Arthur'

    const vatPercentage = 7
    const utilityLimitPerSqm = 3
    const electricityLimit = 100
    const penaltyAmount = 5000
    const minorRepairLimit = 75
    const annualRepairLimitPercentage = 8
    const keyReplacementFee = 150
    const cleaningFeeSmall = 150
    const cleaningFeeLarge = 250
    const sizeThreshold = 60
    const cleaningFeePerRoom = 100

    const moveInTime = '15:00'
    const moveOutTime = '11:00'
    const officeHours = '09:00 – 17:00'
    const accessHours = '09:00 – 17:00'
    const paymentRef = `LEASE-${id}`

    const today = new Date().toISOString().slice(0, 10)
    const nights = Math.max(1, Math.ceil((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000*60*60*24)))

    // Resolve property details (address / monthly price)
    let prop: any = null
    for (const c in cityProperties) {
      const p = (cityProperties as any)[c].find((x: any) => x.id === b!.propertyId)
      if (p) { prop = p; break }
    }
    // If not found in cityProperties, attempt Prisma property fallback
    if (!prop) {
      const pb = await prisma.property.findFirst({ where: { OR: [ { extId: b.propertyId }, { id: b.propertyId } ] } })
      if (pb) {
        prop = { location: pb.address || `${b.propertyTitle}, ${b.city}`, price: pb.priceMonthly || 0 }
      }
    }
    const addressLine = prop?.location || `${b!.propertyTitle}, ${b!.city}`
    const monthly = Number(prop?.price || 0)
    const monthsRounded = Math.max(1, Math.ceil(nights / 30))
    let depositMonths = 1
    if (monthsRounded > 3) depositMonths = 2
    else if (monthsRounded === 1) depositMonths = 0.5
    const deposit = Math.round(monthly * depositMonths)

    

    // Always generate a fresh dual-column PDF (not overlaying existing files)
    const outDir = path.join(process.cwd(), 'public', 'leases')
    fs.mkdirSync(outDir, { recursive: true })
    const outPath = path.join(outDir, `${id}.pdf`)

    const mod: any = await import('pdf-lib')
    const { PDFDocument, StandardFonts, rgb } = mod
    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage([595, 842])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    let fontBold = font
    try {
      fontBold = await pdfDoc.embedFont((StandardFonts as any).HelveticaBold || StandardFonts.Helvetica)
    } catch {
      fontBold = font
    }

    const sanitize = (s: string) => {
      return String(s)
        // currency & dashes
        .replace(/€/g, 'EUR')
        .replace(/[–—]/g, '-')
        // quotes & punctuation
        .replace(/[“”„]/g, '"')
        .replace(/’/g, "'")
        .replace(/…/g, '...')
        // bullets & boxes
        .replace(/•/g, '-')
        .replace(/☐/g, '[ ]')
        .replace(/[✓✔]/g, '[x]')
        .replace(/[✗✘]/g, '[x]')
        // math & arrows
        .replace(/≤/g, '<=')
        .replace(/≥/g, '>=')
        .replace(/→/g, '->')
        // spaces
        .replace(/\u00A0/g, ' ')
    }
    const drawText = (text: string, x: number, y: number, size = 10) => {
      const t = sanitize(text)
      page.drawText(t, { x, y, size, font, color: rgb(0, 0, 0) })
    }
    const wrapText = (text: string, x: number, y: number, maxWidth: number, size = 10, fnt = font, draw = true) => {
      const words = sanitize(text).split(/\s+/)
      let line = ''
      let cursor = y
      for (const w of words) {
        const test = (line ? line + ' ' : '') + w
        const width = fnt.widthOfTextAtSize(test, size)
        if (width > maxWidth) {
          if (line) {
            if (draw) page.drawText(line, { x, y: cursor, size, font: fnt })
            cursor -= size + 4
            line = w
          } else {
            // force split very long single word
            let chunk = ''
            for (const ch of w) {
              const cand = chunk + ch
              const w2 = fnt.widthOfTextAtSize(cand, size)
              if (w2 > maxWidth) {
                if (draw) page.drawText(chunk, { x, y: cursor, size, font: fnt })
                cursor -= size + 4
                chunk = ch
              } else {
                chunk = cand
              }
            }
            line = chunk
          }
        } else {
          line = test
        }
      }
      if (line) { if (draw) page.drawText(line, { x, y: cursor, size, font: fnt }); cursor -= size + 6 }
      return cursor
    }
    const wrapPara = (text: string, x: number, y: number, maxWidth: number, size = 10) => wrapText(text, x, y, maxWidth, size, font, true)
    const wrapHeading = (text: string, x: number, y: number, maxWidth: number) => wrapText(text, x, y, maxWidth, 11, fontBold, true)
    const measurePara = (text: string, y: number, maxWidth: number, size = 10) => wrapText(text, 0, y, maxWidth, size, font, false)
    const measureHeading = (text: string, y: number, maxWidth: number) => wrapText(text, 0, y, maxWidth, 11, fontBold, false)

    const leftX = 48
    const pageMid = Math.floor(page.getWidth()/2)
    const rightX = pageMid + 10
    const colWidth = Math.floor(page.getWidth()/2) - 58
    let yL = page.getHeight() - 70
    let yR = page.getHeight() - 70
    const minY = 70
    const DRAW_DIVIDER = false
    const drawDivider = () => {
      if (!DRAW_DIVIDER) return
      const top = page.getHeight() - 60
      const bottom = 50
      page.drawRectangle({ x: pageMid - 1, y: bottom, width: 2, height: top - bottom, color: undefined, borderColor: rgb(0,0,0), borderWidth: 1 })
    }
    const newPage = () => {
      page = pdfDoc.addPage([595, 842])
      yL = page.getHeight() - 70
      yR = page.getHeight() - 70
      drawDivider()
    }
    const ensureSpace = () => {
      if (yL < minY || yR < minY) newPage()
    }
    const DRAW_SECTION_BOXES = false
    const drawSectionBox = (x: number, startY: number, endY: number) => {
      if (!DRAW_SECTION_BOXES) return
      const padX = 8
      const padTop = 16
      const padBottom = 12
      const bottom = Math.max(50, endY - padBottom)
      const top = startY + padTop
      const height = Math.max(12, top - bottom)
      page.drawRectangle({ x: x - padX, y: bottom, width: colWidth + padX*2, height, color: undefined, borderColor: rgb(0,0,0), borderWidth: 1 })
    }

    // Header
    yL = wrapHeading('ZEITMIETVERTRAG ÜBER MÖBLIERTEN WOHNRAUM', leftX, yL, colWidth); yL -= 2
    yR = wrapHeading('FIXED LEASE AGREEMENT FOR FURNISHED ACCOMMODATION', rightX, yR, colWidth); yR -= 2
    drawDivider()
    ensureSpace()

    // 1. Lessor
    // Section 1 (measure → box → draw)
    let yTmp = yL
    yTmp = measureHeading('1. Vermieter / Lessor', yTmp, colWidth-4)
    yTmp = measurePara(`${company}`, yTmp, colWidth)
    yTmp = measurePara(`Vertreten durch Geschäftsführer/in ${companyRepresentative}`, yTmp, colWidth)
    yTmp = measurePara(`${companyAddrStreet}`, yTmp, colWidth)
    yTmp = measurePara(`${companyAddrPostalCity}`, yTmp, colWidth)
    drawSectionBox(leftX, yL, yTmp)
    const s1L = yL; yL = wrapHeading('1. Vermieter / Lessor', leftX+2, yL, colWidth-4)
    yL = wrapPara(`${company}`, leftX, yL, colWidth)
    yL = wrapPara(`Vertreten durch Geschäftsführer/in ${companyRepresentative}`, leftX, yL, colWidth)
    yL = wrapPara(`${companyAddrStreet}`, leftX, yL, colWidth)
    yL = wrapPara(`${companyAddrPostalCity}`, leftX, yL, colWidth)
    const s1Rstart = yR
    yTmp = yR
    yTmp = measureHeading('1. Lessor', yTmp, colWidth-4)
    yTmp = measurePara(`${company}`, yTmp, colWidth)
    yTmp = measurePara(`Represented by ${companyRepresentative}`, yTmp, colWidth)
    yTmp = measurePara(`${companyAddrStreet}`, yTmp, colWidth)
    yTmp = measurePara(`${companyAddrPostalCity}`, yTmp, colWidth)
    drawSectionBox(rightX, s1Rstart, yTmp)
    const s1R = yR; yR = wrapHeading('1. Lessor', rightX+2, yR, colWidth-4)
    yR = wrapPara(`${company}`, rightX, yR, colWidth)
    yR = wrapPara(`Represented by ${companyRepresentative}`, rightX, yR, colWidth)
    yR = wrapPara(`${companyAddrStreet}`, rightX, yR, colWidth)
    yR = wrapPara(`${companyAddrPostalCity}`, rightX, yR, colWidth)
    ensureSpace()

    // 2. Tenant
    // Section 2
    yTmp = yL
    yTmp = measureHeading('2. Mieter / Tenant', yTmp, colWidth-4)
    yTmp = measurePara(`${b.clientName}`, yTmp, colWidth)
    yTmp = measurePara(`Phone No.: —`, yTmp, colWidth)
    yTmp = measurePara(`E-Mail: —`, yTmp, colWidth)
    drawSectionBox(leftX, yL, yTmp)
    const s2L = yL; yL = wrapHeading('2. Mieter / Tenant', leftX+2, yL, colWidth-4)
    yL = wrapPara(`${b.clientName}`, leftX, yL, colWidth)
    yL = wrapPara(`Phone No.: —`, leftX, yL, colWidth)
    yL = wrapPara(`E-Mail: —`, leftX, yL, colWidth)
    yTmp = yR
    yTmp = measureHeading('2. Tenant', yTmp, colWidth-4)
    yTmp = measurePara(`${b.clientName}`, yTmp, colWidth)
    yTmp = measurePara(`Phone No.: —`, yTmp, colWidth)
    yTmp = measurePara(`E-Mail: —`, yTmp, colWidth)
    drawSectionBox(rightX, yR, yTmp)
    const s2R = yR; yR = wrapHeading('2. Tenant', rightX+2, yR, colWidth-4)
    yR = wrapPara(`${b.clientName}`, rightX, yR, colWidth)
    yR = wrapPara(`Phone No.: —`, rightX, yR, colWidth)
    yR = wrapPara(`E-Mail: —`, rightX, yR, colWidth)
    ensureSpace()

    // 3. Contract Subject
    const s3L = yL; yL = wrapHeading('3. Vertragsgegenstand / Contract Subject, Rental Property', leftX+2, yL, colWidth-4)
    yL = wrapPara('Folgender möblierter Wohnraum wird zu Wohnzwecken vermietet:', leftX, yL, colWidth)
    yL = wrapPara(`${addressLine}`, leftX, yL, colWidth)
    yL = wrapPara('Type: Furnished Residence  No.: —', leftX, yL, colWidth)
    drawSectionBox(leftX, s3L, yL)
    const s3R = yR; yR = wrapHeading('3. Contract Subject, Rental Property', rightX+2, yR, colWidth-4)
    yR = wrapPara('The following furnished accommodation is rented for residential purposes:', rightX, yR, colWidth)
    yR = wrapPara(`${addressLine}`, rightX, yR, colWidth)
    yR = wrapPara('Type: Furnished Residence  No.: —', rightX, yR, colWidth)
    drawSectionBox(rightX, s3R, yR)
    ensureSpace()

    // 4. Term of Tenancy
    const s4L = yL; yL = wrapHeading('4. Mietdauer / Term of Tenancy', leftX+2, yL, colWidth-4)
    yL = wrapPara(`Mietbeginn: ${b.checkIn}  Einzug ab frühestens: ${moveInTime}`, leftX, yL, colWidth)
    yL = wrapPara(`Mietende: ${b.checkOut}  Auszug bis spätestens: ${moveOutTime}`, leftX, yL, colWidth)
    yL = wrapPara(`Ein-/Auszug nur Bürozeiten Mo–Fr: ${officeHours}`, leftX, yL, colWidth)
    drawSectionBox(leftX, s4L, yL)
    const s4R = yR; yR = wrapHeading('4. Term of Tenancy', rightX+2, yR, colWidth-4)
    yR = wrapPara(`Start Date: ${b.checkIn}  earliest move-in time: ${moveInTime}`, rightX, yR, colWidth)
    yR = wrapPara(`End Date: ${b.checkOut}  latest move-out time: ${moveOutTime}`, rightX, yR, colWidth)
    yR = wrapPara(`Move-in and Move-out only during office hours, Mon–Fri: ${officeHours}`, rightX, yR, colWidth)
    drawSectionBox(rightX, s4R, yR)
    ensureSpace()

    // 5. Rent and Deposit
    const s5L = yL; yL = wrapHeading('5. Miete und Kaution / Rent and Deposit', leftX+2, yL, colWidth-4)
    yL = wrapPara(`Monatliche Miete: € ${Number(monthly).toLocaleString('de-DE')}`, leftX, yL, colWidth)
    yL = wrapPara(`Kaution: € ${Number(deposit).toLocaleString('de-DE')} (Regel: 0,5x für 1 Monat; 1x für <=3 Monate; 2x für >3 Monate)`, leftX, yL, colWidth)
    yL = wrapPara('Die Kaution und die erste Monatsmiete sind 72 Stunden nach beiderseitiger Unterzeichnung zu zahlen.', leftX, yL, colWidth)
    drawSectionBox(leftX, s5L, yL)
    const s5R = yR; yR = wrapHeading('5. Rent and Deposit', rightX+2, yR, colWidth-4)
    yR = wrapPara(`Fixed monthly rent: € ${Number(monthly).toLocaleString('de-DE')}`, rightX, yR, colWidth)
    yR = wrapPara(`Deposit: € ${Number(deposit).toLocaleString('de-DE')} (0.5x for 1 month; 1x for <=3 months; 2x for >3 months)`, rightX, yR, colWidth)
    yR = wrapPara('Deposit and first monthly rent due within 72 hours of mutual signature.', rightX, yR, colWidth)
    drawSectionBox(rightX, s5R, yR)
    ensureSpace()

    // 6. Bank details
    const s6L = yL; yL = wrapHeading('6. Kontoverbindung für Mietzahlungen', leftX+2, yL, colWidth-4)
    yL = wrapPara(`${company}`, leftX, yL, colWidth)
    yL = wrapPara(`${bankName}`, leftX, yL, colWidth)
    yL = wrapPara(`IBAN: ${bankIban}`, leftX, yL, colWidth)
    yL = wrapPara(`BIC: ${bankBic}`, leftX, yL, colWidth)
    yL = wrapPara(`Verwendungszweck: ${paymentRef}`, leftX, yL, colWidth)
    drawSectionBox(leftX, s6L, yL)
    const s6R = yR; yR = wrapHeading('6. Bank Account for Payments to Lessor', rightX+2, yR, colWidth-4)
    yR = wrapPara(`${company}`, rightX, yR, colWidth)
    yR = wrapPara(`${bankName}`, rightX, yR, colWidth)
    yR = wrapPara(`IBAN: ${bankIban}`, rightX, yR, colWidth)
    yR = wrapPara(`BIC: ${bankBic}`, rightX, yR, colWidth)
    yR = wrapPara(`Payment Reference: ${paymentRef}`, rightX, yR, colWidth)
    drawSectionBox(rightX, s6R, yR)
    ensureSpace()

    // §1 Contract Subject details
    yL = wrapHeading('§1 VERTRAGSGEGENSTAND / CONTRACT SUBJECT', leftX, yL, colWidth)
    yL = wrapPara(`${addressLine}`, leftX, yL, colWidth)
    yL = wrapPara('Type: Furnished Residence / No.: —', leftX, yL, colWidth)
    yL = wrapPara('Dem Mieter werden folgende Schlüssel ausgehändigt: [s. Übergabeprotokoll]', leftX, yL, colWidth)
    yL = wrapPara('Der Wohnraum ist vollständig möbliert und enthält das Mobiliar gemäß Anlage 1.', leftX, yL, colWidth)
    yR = wrapHeading('§1 CONTRACT SUBJECT', rightX, yR, colWidth)
    yR = wrapPara(`${addressLine}`, rightX, yR, colWidth)
    yR = wrapPara('Type: Furnished Residence / No.: —', rightX, yR, colWidth)
    yR = wrapPara('Keys handed over per handover protocol.', rightX, yR, colWidth)
    yR = wrapPara('Accommodation is fully furnished per Annex 1.', rightX, yR, colWidth)
    ensureSpace()

    // §2 Term
    yL = wrapHeading('§2 MIETDAUER / TERM OF LEASE', leftX, yL, colWidth)
    yL = wrapPara(`Beginn: ${b.checkIn}  —  Ende: ${b.checkOut}. Endet automatisch ohne Kündigung.`, leftX, yL, colWidth)
    yL = wrapPara(`Erstbezug am Tag des Mietbeginns ab ${moveInTime}.`, leftX, yL, colWidth)
    yR = wrapHeading('§2 TERM OF LEASE', rightX, yR, colWidth)
    yR = wrapPara(`Tenancy begins ${b.checkIn} and ends ${b.checkOut}. Ends automatically without notice.`, rightX, yR, colWidth)
    yR = wrapPara(`Move-in on start day after ${moveInTime}.`, rightX, yR, colWidth)
    ensureSpace()

    // §3 Condition & transfer
    yL = wrapHeading('§3 ZUSTAND DER MIETSACHE UND ÜBERGABE', leftX, yL, colWidth)
    yL = wrapPara('Übergabeprotokoll; Mängel aufzunehmen und zu unterschreiben. Kein Austausch/Entfernung des Mobiliars.', leftX, yL, colWidth)
    yL = wrapPara('Nichtverfügbarkeit zu Mietbeginn: Ansprüche nur bei Vorsatz/grober Fahrlässigkeit des Vermieters.', leftX, yL, colWidth)
    yR = wrapHeading('§3 CONDITION OF THE LEASE OBJECT AND TRANSFER', rightX, yR, colWidth)
    yR = wrapPara('Mutual handover protocol with defects. No exchange/removal of furniture.', rightX, yR, colWidth)
    yR = wrapPara('If unavailable at start: claims only if landlord acted willfully/grossly negligent.', rightX, yR, colWidth)
    ensureSpace()

    // §4 Payment & sustainability
    yL = wrapHeading('§4 ZAHLUNG VON MIETE UND NEBENKOSTEN', leftX, yL, colWidth)
    yL = wrapPara('Gesamtmiete (Kaltmiete + Nebenkosten) im Voraus bis zum 1. Werktag.', leftX, yL, colWidth)
    yL = wrapPara('Nachhaltigkeit: Verbrauchsbeschränkungen für Wasser, Gas, Strom, Internet.', leftX, yL, colWidth)
    yL = wrapPara(`Betriebskosten außer Strom: Limit ${utilityLimitPerSqm} €/m²/Monat & Einheit; Stromlimit: € ${electricityLimit}/Monat & Einheit.`, leftX, yL, colWidth)
    yL = wrapPara(`TV-Beitrag nicht enthalten. Enthält USt. von ${vatPercentage}%.`, leftX, yL, colWidth)
    yR = wrapHeading('§4 PAYMENT OF THE RENT AND ANCILLARY COSTS', rightX, yR, colWidth)
    yR = wrapPara('Entire rent (cold + ancillary) payable in advance by the 1st working day.', rightX, yR, colWidth)
    yR = wrapPara('Sustainability: usage caps for water, gas, electricity, internet.', rightX, yR, colWidth)
    yR = wrapPara(`Operating costs excl. electricity: cap ${utilityLimitPerSqm} €/sqm/month & unit; electricity cap € ${electricityLimit}/month & unit.`, rightX, yR, colWidth)
    yR = wrapPara(`TV contribution not included. Includes VAT of ${vatPercentage}%.`, rightX, yR, colWidth)
    ensureSpace()

    // §5 Deposit
    yL = wrapHeading('§5 KAUTION / DEPOSIT', leftX, yL, colWidth)
    yL = wrapPara(`Kaution: € ${Number(deposit).toLocaleString('de-DE')}. Zahlung binnen 72h mit erster Miete.`, leftX, yL, colWidth)
    yL = wrapPara('Keine Aufrechnung mit nicht fälligem Rückzahlungsanspruch. Abrechnung nach Rückgabe.', leftX, yL, colWidth)
    yR = wrapHeading('§5 DEPOSIT', rightX, yR, colWidth)
    yR = wrapPara(`Deposit: € ${Number(deposit).toLocaleString('de-DE')}. Due within 72h with first rent.`, rightX, yR, colWidth)
    yR = wrapPara('No set-off with not-yet-due claim. Settlement after return.', rightX, yR, colWidth)
    ensureSpace()

    // §6 Use / sublease
    yL = wrapHeading('§6 NUTZUNG DER MIETSACHE / UNTERVERMIETUNG', leftX, yL, colWidth)
    yL = wrapPara(`Nur Wohnzwecke; gewerbliche Nutzung & Überlassung an Dritte untersagt. Vertragsstrafe bis € ${penaltyAmount}.`, leftX, yL, colWidth)
    yR = wrapHeading('§6 USE OF LEASE OBJECT / SUBLEASE', rightX, yR, colWidth)
    yR = wrapPara(`Residential use only; commercial use and transfer to third parties prohibited. Penalty up to € ${penaltyAmount}.`, rightX, yR, colWidth)
    ensureSpace()

    // §7 Changes, repairs
    yL = wrapHeading('§7 BAULICHE VERÄNDERUNGEN, AUS- UND VERBESSERUNGEN', leftX, yL, colWidth)
    yL = wrapPara('Erhaltungs-/Gefahrenabwehrmaßnahmen ohne Zustimmung zulässig; Mieter darf Arbeiten nicht behindern.', leftX, yL, colWidth)
    yL = wrapPara('Keine den vertragsgemäßen Gebrauch überschreitenden Änderungen durch den Mieter.', leftX, yL, colWidth)
    yR = wrapHeading('§7 CONSTRUCTIONAL CHANGES, REPAIRS AND IMPROVEMENTS', rightX, yR, colWidth)
    yR = wrapPara('Landlord may perform necessary works; tenant shall not hinder.', rightX, yR, colWidth)
    yR = wrapPara('No changes exceeding contractual use.', rightX, yR, colWidth)
    ensureSpace()

    // §8 Maintenance & damages
    yL = wrapHeading('§8 INSTANDHALTUNG DER MIETSACHE UND SCHÄDEN', leftX, yL, colWidth)
    yL = wrapPara('Pflegliche Behandlung; ordentliche Reinigung, Lüftung, Heizung. Anzeigepflicht.', leftX, yL, colWidth)
    yL = wrapPara('Haftung für unsachgemäßen Gebrauch; Beweislast in exklusiven Bereichen beim Mieter.', leftX, yL, colWidth)
    yR = wrapHeading('§8 MAINTENANCE OF LEASE OBJECT AND DAMAGES', rightX, yR, colWidth)
    yR = wrapPara('Careful use; proper cleaning, ventilation, heating. Duty to notify.', rightX, yR, colWidth)
    yR = wrapPara('Liability for improper use; burden of proof in exclusively used areas.', rightX, yR, colWidth)
    ensureSpace()

    // §9 Minor losses
    yL = wrapHeading('§9 BAGATELLSCHÄDEN / MINOR LOSSES', leftX, yL, colWidth)
    yL = wrapPara(`Kosten bis € ${minorRepairLimit} pro Fall; jährliche Obergrenze ${annualRepairLimitPercentage}% der Jahreskaltmiete.`, leftX, yL, colWidth)
    yR = wrapPara(`Costs up to € ${minorRepairLimit} per case; annual cap ${annualRepairLimitPercentage}% of annual cold rent.`, rightX, yR, colWidth)
    ensureSpace()

    // §10 Access
    yL = wrapHeading('§10 BETRETEN DER WOHNUNG / ACCESS', leftX, yL, colWidth)
    yL = wrapPara(`Zutritt werktags ${accessHours} nach Abstimmung; Notfälle ohne Ankündigung.`, leftX, yL, colWidth)
    yR = wrapPara(`Access on working days ${accessHours} after coordination; emergencies without notice.`, rightX, yR, colWidth)
    ensureSpace()

    // §11 Termination
    yL = wrapHeading('§11 KÜNDIGUNG / TERMINATION', leftX, yL, colWidth)
    yL = wrapPara('Nur außerordentliche Kündigung in Ausnahmefällen; keine stillschweigende Verlängerung (§545 BGB ausgeschlossen).', leftX, yL, colWidth)
    yR = wrapPara('Termination only for extraordinary cases; no implicit prolongation (Section 545 BGB excluded).', rightX, yR, colWidth)
    ensureSpace()

    // §12 House rules
    yL = wrapHeading('§12 HAUS- UND BENUTZUNGSORDNUNG / HOUSE AND USE RULES', leftX, yL, colWidth)
    yL = wrapPara('Hausordnung als Anlage; Änderungen aus dringenden Gründen möglich; Einhaltung verpflichtend.', leftX, yL, colWidth)
    yR = wrapPara('House rules attached; changes possible for urgent reasons; adherence mandatory.', rightX, yR, colWidth)
    ensureSpace()

    // §13 Return & cleaning
    yL = wrapHeading('§13 RÜCKGABE / RETURN', leftX, yL, colWidth)
    yL = wrapPara('Besenrein inkl. Inventar & Schlüsseln; ggf. ursprünglicher Zustand herzustellen.', leftX, yL, colWidth)
    yL = wrapPara(`Endreinigung: € ${cleaningFeeSmall} (<=${sizeThreshold} qm), € ${cleaningFeeLarge} (> ${sizeThreshold} qm); WG: € ${cleaningFeePerRoom}/Zimmer. Checkout bis ${moveOutTime}.`, leftX, yL, colWidth)
    yR = wrapPara('Broom clean with inventory & keys; restore original condition if required.', rightX, yR, colWidth)
    yR = wrapPara(`Final cleaning: € ${cleaningFeeSmall} (<=${sizeThreshold} sqm), € ${cleaningFeeLarge} (> ${sizeThreshold} sqm); shared: € ${cleaningFeePerRoom}/room. Checkout by ${moveOutTime}.`, rightX, yR, colWidth)
    ensureSpace()

    // §14 Data protection / system consent
    yL = wrapHeading('§14 DATENSCHUTZ / DATA PROTECTION', leftX, yL, colWidth)
    yL = wrapPara(`Digitales Bewirtschaftungssystem (${propertyManagementSystem}); Einwilligung erforderlich.`, leftX, yL, colWidth)
    yL = wrapPara('☐ Stimme zu.   ☐ Stimme nicht zu', leftX, yL, colWidth)
    yL = wrapPara(`Widerruf an ${contactEmail}. Infos: ${systemInfoUrl}`, leftX, yL, colWidth)
    yR = wrapPara(`Digital asset management system (${propertyManagementSystem}); consent required.`, rightX, yR, colWidth)
    yR = wrapPara('[ ] Agree   [ ] Disagree', rightX, yR, colWidth)
    yR = wrapPara(`Withdrawal via ${contactEmail}. Info: ${systemInfoUrl}`, rightX, yR, colWidth)
    ensureSpace()

    // §15 Other agreements
    yL = wrapHeading('§15 SONSTIGE VEREINBARUNGEN / OTHER AGREEMENTS', leftX, yL, colWidth)
    yL = wrapPara('Salvatorische Klausel. Datenverarbeitung nach DSGVO. Inventarliste als Anlage.', leftX, yL, colWidth)
    yL = wrapPara(`Tiere nicht erlaubt. Schlüsselverlustgebühr: € ${keyReplacementFee}. Nur deutsche Fassung rechtsverbindlich.`, leftX, yL, colWidth)
    yR = wrapPara('Severability. Data processing pursuant to GDPR. Inventory list attached.', rightX, yR, colWidth)
    yR = wrapPara(`No pets. Key replacement fee: € ${keyReplacementFee}. Only German version legally binding.`, rightX, yR, colWidth)
    ensureSpace()

    // Signatures / footer box
    const signTop = 150
    // left (German)
    page.drawRectangle({ x: leftX - 8, y: 50, width: colWidth + 16, height: signTop - 50, color: undefined, borderColor: rgb(0,0,0), borderWidth: 1 })
    const contractLocation = b.city || 'Berlin'
    drawText(`${contractLocation}, ${today}`, leftX, 130)
    drawText(`${company}`, leftX, 112)
    page.drawRectangle({ x: leftX, y: 98, width: colWidth - 20, height: 1, color: rgb(0,0,0) })
    // instruction below the line, right-aligned
    { const txt = 'Signature / Unterschrift'; const w = font.widthOfTextAtSize(txt, 9); page.drawText(txt, { x: leftX + (colWidth - 20) - w, y: 86, size: 9, font }) }
    drawText('Vermieter / Landlord', leftX, 76)
    // right (English)
    page.drawRectangle({ x: rightX - 8, y: 50, width: colWidth + 16, height: signTop - 50, color: undefined, borderColor: rgb(0,0,0), borderWidth: 1 })
    drawText(`${contractLocation}, ${today}`, rightX, 130)
    drawText(`${b.clientName}`, rightX, 112)
    page.drawRectangle({ x: rightX, y: 98, width: colWidth - 20, height: 1, color: rgb(0,0,0) })
    { const txt = 'Signature / Unterschrift'; const w = font.widthOfTextAtSize(txt, 9); page.drawText(txt, { x: rightX + (colWidth - 20) - w, y: 86, size: 9, font }) }
    drawText('Tenant / Mieter', rightX, 76)

    try {
      const bytes = await pdfDoc.save()
      fs.writeFileSync(outPath, bytes)
    } catch (err) {
      // If save still fails after sanitization, bubble the error so UI shows message
      throw err
    }

    const publicPath = `/leases/${id}.pdf`
    if (idx !== -1) {
      bookings[idx].leasePdf = publicPath
      try { fs.writeFileSync(dataPath, JSON.stringify(bookings, null, 2), 'utf-8') } catch {}
    }

    return NextResponse.json({ ok: true, url: publicPath })
  } catch (e: any) {
    console.error('Lease generation error:', e)
    return NextResponse.json({ message: 'Failed to generate', error: String(e?.message || e) }, { status: 500 })
  }
}
