import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cityProperties } from '@/data/cityProperties'

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function POST(req: Request) {
  try {
    const b = await req.json().catch(()=> ({}))
    const propertyExtId = String(b.propertyExtId || '').trim()
    const email = String(b.email || '').trim()
    const name = String(b.name || '').trim()
    const termMonths = Math.max(1, Number(b.termMonths || 1))
    const monthlyRateCents = Math.max(0, Number(b.monthlyRateCents || 0))
    const moveInFeeCents = Math.max(0, Number(b.moveInFeeCents || 0))
    const depositCents = Math.max(0, Number(b.depositCents || 0))
    const startDate = b.startDate ? new Date(b.startDate) : new Date()
    if (!propertyExtId) return NextResponse.json({ ok:false, error:'property-required' }, { status: 400 })

    let property = await prisma.property.findUnique({ where: { extId: propertyExtId } })
    // Fallback: create a minimal Property record from cityProperties so prod works without seed
    if (!property) {
      let meta: any = null
      for (const c in cityProperties as any) {
        const found = (cityProperties as any)[c]?.find?.((p: any) => p.id === propertyExtId)
        if (found) { meta = { ...found, city: c }; break }
      }
      if (meta) {
        try {
          property = await prisma.property.create({
            data: {
              extId: propertyExtId,
              title: String(meta.title || meta.name || propertyExtId),
              address: String(meta.location || ''),
              priceMonthly: Number(meta.price || 0),
            } as any,
          })
        } catch {
          // Try a minimal insert if model is stricter
          try {
            property = await prisma.property.create({
              data: {
                extId: propertyExtId,
                title: String(meta.title || meta.name || propertyExtId),
              } as any,
            })
          } catch {}
        }
      }
    }
    if (!property) return NextResponse.json({ ok:false, error:'property-not-found' }, { status: 404 })

    let userId: string | undefined
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } }).catch(()=>null)
      if (existing) {
        userId = existing.id
        // Persist phone if provided and missing
        if (b.phone && !existing.phone) {
          try { await prisma.user.update({ where: { id: existing.id }, data: { phone: String(b.phone) } }) } catch {}
        }
      }
      else {
        const created = await prisma.user.create({ data: { email, name: name || email.split('@')[0], phone: b.phone ? String(b.phone) : undefined } as any }).catch(()=>null)
        if (created) userId = created.id
      }
    }

    const checkin = startDate
    const checkout = addMonths(checkin, termMonths)
    const totalCents = Number(monthlyRateCents * termMonths + moveInFeeCents + depositCents)

    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId,
        checkin,
        checkout,
        status: 'hold',
        totalCents,
      },
      include: { property: true, user: true }
    })

    // Create initial payments: deposit, move-in fee, first period
    const paymentsToCreate: any[] = []
    if (depositCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'deposit',
        dueAt: checkin,
        amountCents: depositCents,
        currency: 'EUR',
      })
    }
    if (moveInFeeCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'move_in_fee',
        dueAt: checkin,
        amountCents: moveInFeeCents,
        currency: 'EUR',
      })
    }
    if (monthlyRateCents > 0) {
      paymentsToCreate.push({
        bookingId: booking.id,
        provider: 'manual',
        status: 'scheduled',
        purpose: 'first_period',
        dueAt: checkin,
        amountCents: monthlyRateCents,
        currency: 'EUR',
      })
    }
    // Remaining months as monthly_rent
    if (monthlyRateCents > 0 && termMonths > 1) {
      for (let i = 1; i < termMonths; i++) {
        paymentsToCreate.push({
          bookingId: booking.id,
          provider: 'manual',
          status: 'scheduled',
          purpose: 'monthly_rent',
          dueAt: addMonths(checkin, i),
          amountCents: monthlyRateCents,
          currency: 'EUR',
        })
      }
    }
    let createdPayments: any[] = []
    if (paymentsToCreate.length) {
      createdPayments = await prisma.$transaction(
        paymentsToCreate.map((p) => prisma.payment.create({ data: p }))
      )
    }

    return NextResponse.json({ ok:true, data: { id: booking.id, adminUrl: `/admin/bookings?highlight=${booking.id}`, payments: createdPayments } })
  } catch (e) {
    console.error('create-booking error', e)
    return NextResponse.json({ ok:false, error:'create-failed' }, { status: 500 })
  }
}


