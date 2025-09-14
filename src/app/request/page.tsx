'use client'

import React, { useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cityProperties } from '@/data/cityProperties'

export default function RequestToBook() {
  const params = useSearchParams()
  const id = params.get('id') || ''
  const title = params.get('title') || 'Your stay'
  const img = params.get('img') || ''
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''
  const nightsParam = Number(params.get('nights') || '0')
  const subtotalParam = Number(params.get('subtotal') || '0')

  const [subtotalCalc, setSubtotalCalc] = useState<number | null>(null)
  const [paidByCompany, setPaidByCompany] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card')
  const [cryptoCurrency, setCryptoCurrency] = useState<'ETH' | 'USDT' | 'BTC'>('ETH')
  const [copied, setCopied] = useState<boolean>(false)
  const [calendarState, setCalendarState] = useState<Record<string, any>>({})
  const [payNowInfo, setPayNowInfo] = useState<{ from: string, to: string, amount: number } | null>(null)
  const [nextPayments, setNextPayments] = useState<Array<{ chargeDate: string, coverage: string, amount: number }>>([])
  const [monthlyRent, setMonthlyRent] = useState<number>(0)
  const [damageDeposit, setDamageDeposit] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0.15)

  // Receiving wallet addresses (replace with environment variables in production)
  const ETH_ERC20_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'
  const BTC_ADDRESS = 'bc1qexampleexampleexampleexamplex9q2p7'

  const selectedAddress = cryptoCurrency === 'BTC' ? BTC_ADDRESS : ETH_ERC20_ADDRESS
  const qrValue = cryptoCurrency === 'BTC' ? `bitcoin:${selectedAddress}` : `ethereum:${selectedAddress}`
  useEffect(() => {
    (async () => {
      if (!id || !checkin || !checkout) { setSubtotalCalc(null); return }
      // locate property
      let found: any = null
      for (const city in cityProperties) {
        const arr = (cityProperties as any)[city]
        const p = arr.find((x: any) => x.id === id)
        if (p) { found = p; break }
      }
      // load calendar overrides
      let calendar: Record<string, any> = {}
      try {
        const res = await fetch('/api/admin/overrides', { cache: 'no-store' })
        const data = await res.json()
        calendar = data?.[id]?.calendar || {}
      } catch {}
      setCalendarState(calendar)
      const nightly = (found?.price ? Math.round((found.price/30)*100)/100 : 0)
      const monthlyFromData = found?.price ? Number(found.price) : Math.round(nightly * 30 * 100) / 100
      setMonthlyRent(monthlyFromData)
      // Determine VAT rate (Germany 7%, else 15%) using property location or URL destination
      try {
        const locStr = String(found?.location || '').toLowerCase()
        const urlDestStr = (params.get('destination') || '').toLowerCase()
        const resolved = (locStr.includes('germany') || urlDestStr.includes('germany')) ? 0.07 : 0.15
        setTaxRate(resolved)
      } catch {}
      const s = new Date(checkin)
      const e = new Date(checkout)
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) { setSubtotalCalc(null); return }
      let sum = 0
      for (let d = new Date(s); d < e; d.setDate(d.getDate()+1)) {
        const k = d.toISOString().slice(0,10)
        const day = (calendar as any)[k]
        const available = day?.available !== false
        if (!available) { setSubtotalCalc(null); return }
        const priceNight = day?.priceNight ?? nightly
        sum += priceNight
      }
      const totalSum = Math.round(sum*100)/100
      setSubtotalCalc(totalSum)

      // Build UKIO-like schedule: periods anchored to check-in day, each to same day next month
      const formatDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
      const addMonthsKeepDay = (date: Date, add: number) => {
        const targetMonth = date.getMonth() + add
        const targetYear = date.getFullYear() + Math.floor(targetMonth / 12)
        const monthNormalized = ((targetMonth % 12) + 12) % 12
        const day = date.getDate()
        const lastDay = new Date(targetYear, monthNormalized + 1, 0).getDate()
        const useDay = Math.min(day, lastDay)
        return new Date(targetYear, monthNormalized, useDay)
      }
      const endOfCurrentMonth = new Date(s.getFullYear(), s.getMonth() + 1, 0)
      const dayAfterEndOfCurrentMonth = new Date(endOfCurrentMonth.getFullYear(), endOfCurrentMonth.getMonth(), endOfCurrentMonth.getDate() + 1)
      const endOfNextMonth = new Date(s.getFullYear(), s.getMonth() + 2, 0)
      const dayAfterEndOfNextMonth = new Date(endOfNextMonth.getFullYear(), endOfNextMonth.getMonth(), endOfNextMonth.getDate() + 1)
      const crossesMonthEnd = e > dayAfterEndOfCurrentMonth
      let firstPeriodEndExclusive = e
      if (s.getDate() >= 25) {
        firstPeriodEndExclusive = e < dayAfterEndOfNextMonth ? e : dayAfterEndOfNextMonth
      } else if (crossesMonthEnd) {
        firstPeriodEndExclusive = dayAfterEndOfCurrentMonth
      } else {
        firstPeriodEndExclusive = e
      }
      const sumRange = (start: Date, endExclusive: Date) => {
        let acc = 0
        const d = new Date(start)
        for (; d < endExclusive; d.setDate(d.getDate() + 1)) {
          const k = d.toISOString().slice(0,10)
          const day = (calendar as any)[k]
          const available = day?.available !== false
          if (!available) { return 0 }
          const priceNight = day?.priceNight ?? nightly
          acc += priceNight
        }
        return Math.round(acc * 100) / 100
      }
      const firstAmount = sumRange(s, firstPeriodEndExclusive)
      const totalDaysForMessage = Math.max(0, Math.round((e.getTime() - s.getTime())/86400000))
      const displayToDate = (totalDaysForMessage < 60)
        ? e
        : new Date(firstPeriodEndExclusive.getTime() - 86400000)
      setPayNowInfo({ from: formatDate(s), to: formatDate(displayToDate), amount: firstAmount })

      // Damage deposit rules:
      // - 15 to <30 days: fixed €750
      // - < 3 months: 0.5 x monthly
      // - >= 3 months: 1 x monthly
      const totalDays = Math.max(0, Math.round((e.getTime() - s.getTime())/86400000))
      const threeMonthsFromStart = addMonthsKeepDay(s, 3)
      const longerOrEqualThree = e > threeMonthsFromStart || e.getTime() === threeMonthsFromStart.getTime()
      const depositAmount = (totalDays < 15)
        ? 500
        : (totalDays < 30)
          ? 750
          : Math.round((monthlyFromData * (longerOrEqualThree ? 1 : 0.5)) * 100) / 100
      setDamageDeposit(depositAmount)

      const payments: Array<{ chargeDate: string, coverage: string, amount: number }> = []
      // Enable Next payments only if the stay exceeds two months
      const twoMonthsFromStart = addMonthsKeepDay(s, 2)
      const overTwoMonths = e > twoMonthsFromStart
      // Waive move-in fee for stays under 30 days
      setMoveInFeeDue(totalDays < 30 ? 0 : moveInFee)
      if (overTwoMonths) {
        // Next payments start on the 1st following the first period end
        for (let monthStart = new Date(firstPeriodEndExclusive.getFullYear(), firstPeriodEndExclusive.getMonth(), 1); monthStart < e; monthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)) {
          const nextMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
          const end = e < nextMonthStart ? e : nextMonthStart
          if (monthStart >= end) break
          const amt = sumRange(monthStart, end)
          const amtRounded = Math.round(amt * 100) / 100
          const chargeDate = formatDate(monthStart)
          const endLessOne = new Date(end.getTime() - 86400000)
          const coverage = `${monthStart.toLocaleDateString('en-US', { month: 'short' })} 1 - ${monthStart.toLocaleDateString('en-US', { month: 'short' })} ${String(endLessOne.getDate()).padStart(2,'0')}`
          payments.push({ chargeDate, coverage, amount: amtRounded })
        }
      }
      setNextPayments(payments)
    })()
  }, [id, checkin, checkout])

  const subtotal = subtotalCalc ?? subtotalParam
  const moveInFee = 250
  const [moveInFeeDue, setMoveInFeeDue] = useState<number>(moveInFee)
  const total = (Math.round(((subtotal + moveInFeeDue)) * 100) / 100)
  const nights = nightsParam || (checkin && checkout ? Math.max(0, Math.round((new Date(checkout).getTime()-new Date(checkin).getTime())/86400000)) : 0)

  return (
    <main className="min-h-screen bg-white">
      <Header forceBackground={true} />
      <section className="pt-28 pb-20">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Steps */}
          <div className="space-y-6 text-gray-900">
            {/* Booking details */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="font-semibold mb-4">Booking details</div>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 text-sm">Will you be staying in the apartment?</div>
                  <div className="flex items-center gap-6 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="stayer" defaultChecked className="accent-amber-500"/>
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="stayer" className="accent-amber-500"/>
                      <span>No, I'm booking for someone else</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2">Residence country</label>
                  <select className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white">
                    <option value="">Select a country</option>
                    <optgroup label="Europe">
                      <option>Albania</option>
                      <option>Andorra</option>
                      <option>Armenia</option>
                      <option>Austria</option>
                      <option>Azerbaijan</option>
                      <option>Belarus</option>
                      <option>Belgium</option>
                      <option>Bosnia and Herzegovina</option>
                      <option>Bulgaria</option>
                      <option>Croatia</option>
                      <option>Cyprus</option>
                      <option>Czech Republic</option>
                      <option>Denmark</option>
                      <option>Estonia</option>
                      <option>Finland</option>
                      <option>France</option>
                      <option>Georgia</option>
                      <option>Germany</option>
                      <option>Greece</option>
                      <option>Hungary</option>
                      <option>Iceland</option>
                      <option>Ireland</option>
                      <option>Italy</option>
                      <option>Kosovo</option>
                      <option>Latvia</option>
                      <option>Liechtenstein</option>
                      <option>Lithuania</option>
                      <option>Luxembourg</option>
                      <option>Malta</option>
                      <option>Moldova</option>
                      <option>Monaco</option>
                      <option>Montenegro</option>
                      <option>Netherlands</option>
                      <option>North Macedonia</option>
                      <option>Norway</option>
                      <option>Poland</option>
                      <option>Portugal</option>
                      <option>Romania</option>
                      <option>Russia</option>
                      <option>San Marino</option>
                      <option>Serbia</option>
                      <option>Slovakia</option>
                      <option>Slovenia</option>
                      <option>Spain</option>
                      <option>Sweden</option>
                      <option>Switzerland</option>
                      <option>Turkey</option>
                      <option>Ukraine</option>
                      <option>United Kingdom</option>
                      <option>Vatican City</option>
                    </optgroup>
                    <optgroup label="North America">
                      <option>Canada</option>
                      <option>Mexico</option>
                      <option>United States</option>
                    </optgroup>
                    <optgroup label="Oceania">
                      <option>Australia</option>
                      <option>New Zealand</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="font-semibold mb-4">Contact details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="you@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Phone</label>
                  <div className="flex gap-2">
                    <select className="w-28 border border-gray-300 rounded-xl px-2 py-2 bg-white">
                      <option>+49</option>
                      <option>+34</option>
                      <option>+33</option>
                      <option>+39</option>
                      <option>+44</option>
                    </select>
                    <input className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="Phone number" />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="font-semibold mb-1">Address</div>
              <div className="text-sm text-gray-600 mb-4">Add information about your primary residence</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">Street name</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Apt. number (optional)</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Floor (optional)</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">City</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Postal code</label>
                  <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm mb-1">What is the purpose of your stay?</label>
                  <select className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white">
                    <option value="">Select a reason</option>
                    <option>Work</option>
                    <option>Study</option>
                    <option>Relocation</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="inline-flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1 accent-amber-500" />
                    <span className="text-gray-700">By checking this box, I declare that the address provided is my primary residence, and I will reside temporarily for the stated reason. I commit to notifying Swift Luxury about changes in the information provided, and to providing supporting information if required.</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Billing information */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="font-semibold mb-4">Billing information</div>
              <div className="text-sm mb-3">Will your stay be paid for by a company?</div>
              <div className="flex items-center gap-6 text-sm mb-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="companypayer" className="accent-amber-500" checked={!paidByCompany} onChange={() => setPaidByCompany(false)} />
                  <span>No, I am paying for the stay</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="companypayer" className="accent-amber-500" checked={paidByCompany} onChange={() => setPaidByCompany(true)} />
                  <span>Yes</span>
                </label>
              </div>
              {paidByCompany && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Company name</label>
                    <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">VAT ID (optional)</label>
                    <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Payment method</div>
                {paymentMethod === 'crypto' ? (
                  <div className="text-xs text-gray-600 ml-3 text-left">Crypto payments are held in escrow for up to 72hrs. If booking is not approved, full refund is issued automatically.</div>
                ) : paymentMethod === 'card' ? (
                  <div className="text-xs text-gray-600 ml-3 text-left">Credit Card will not be charge until your booking is Confirmed. You will receive an update within 24hrs!</div>
                ) : null}
              </div>
              <div className="flex items-center gap-6 text-sm mb-4">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="paymethod" className="accent-amber-500" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} />
                  <span>Card</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="paymethod" className="accent-amber-500" checked={paymentMethod==='crypto'} onChange={() => setPaymentMethod('crypto')} />
                  <span>Crypto</span>
                </label>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-700">Payment details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1">Cardholder name</label>
                      <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="Name on card" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm mb-1">Card number</label>
                      <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Expiry</label>
                      <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">CVC</label>
                      <input className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white" placeholder="CVC" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-700">Crypto payment</div>
                  <div>
                    <label className="block text-sm mb-1">Currency</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white"
                      value={cryptoCurrency}
                      onChange={(e) => setCryptoCurrency(e.target.value as 'ETH' | 'USDT' | 'BTC')}
                    >
                      <option value="ETH">ETH (ERC-20)</option>
                      <option value="USDT">USDT (ERC-20)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                    </select>
                    <div className="mt-2 text-xs text-gray-600">
                      {cryptoCurrency === 'BTC' ? 'Network: Bitcoin' : 'Network: Ethereum Mainnet'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Wallet address</label>
                    <div className="flex items-center gap-2">
                      <input readOnly className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 text-gray-900" value={selectedAddress} />
                      <button
                        onClick={async () => { try { await navigator.clipboard.writeText(selectedAddress); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {} }}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                      >
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center py-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <QRCode value={qrValue} size={140} />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Send the exact total to this address. Your booking will be confirmed once the payment is detected on-chain.
                  </div>
                </div>
              )}
            </div>

            {/* Review */}
            <div className="rounded-2xl border border-gray-200 shadow-sm p-6 bg-white">
              <div className="font-semibold mb-4">Review your request</div>
              <div className="space-y-3 text-sm">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 accent-amber-500" />
                  <span className="text-gray-700">I agree to the Terms of Service, Sublease Agreement and Cancellation Policy and understand that this reservation is contingent on successfully passing tenant screening.</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 accent-amber-500" />
                  <span className="text-gray-700">I agree to the Privacy Policy.</span>
                </label>
              </div>
              <button className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl" onClick={async()=>{
                try {
                  if (process.env.NEXT_PUBLIC_FEATURE_DB_BOOKINGS === '1' || process.env.FEATURE_DB_BOOKINGS === '1') {
                    const payload = {
                      propertyId: id,
                      user: { name: 'Guest', email: '', phone: '' },
                      checkIn: checkin,
                      checkOut: checkout,
                      totalCents: Math.round(((payNowInfo?.amount ?? subtotal) + moveInFeeDue + damageDeposit) * 100)
                    }
                    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                    if (res.ok) {
                      console.log('Booking created in DB')
                    } else {
                      console.warn('DB booking disabled or failed; proceeding without DB persistence')
                    }
                  }
                } catch(e) {
                  console.warn('Booking API error; proceeding without DB persistence')
                }
              }}>Complete booking</button>
            </div>
          </div>

          {/* Right: Summary + Next payments */}
          <div className="rounded-2xl border border-gray-200 shadow-sm p-6 h-max bg-white">
            <div className="flex gap-4 items-center mb-5">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                {img ? <img src={img} alt={title} className="w-full h-full object-cover"/> : null}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{title}</div>
                <div className="text-sm text-gray-600 mt-1">Dates</div>
                <div className="text-sm text-gray-900">{checkin} → {checkout} ({nights} nights)</div>
              </div>
            </div>
            <div className="mb-3 font-semibold text-gray-900">Pay now</div>
            {payNowInfo && (
              <div className="text-sm text-gray-800 mb-3">This payment includes Rent & Service Fees from {payNowInfo.from} to {payNowInfo.to}</div>
            )}
            <div className="space-y-2 text-sm text-gray-900">
              <div className="flex justify-between"><span>First period</span><span>€{(payNowInfo?.amount ?? subtotal).toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span></div>
              <div className="flex justify-between"><span>Damage Deposit</span><span>
                €{damageDeposit.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              </span></div>
              {moveInFeeDue > 0 && (
                <div className="flex justify-between"><span>Move‑in fee</span><span>€{moveInFeeDue.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</span></div>
              )}
              {/* VAT removed */}
              <hr/>
              <div className="flex justify-between font-semibold text-lg text-gray-900"><span>Total now</span><span>
                €{(() => { const base = (payNowInfo?.amount ?? subtotal) + moveInFeeDue + damageDeposit; return Math.round(base).toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 }) })()}
              </span></div>
            </div>
            {nextPayments.length > 0 && (
              <div className="mt-6">
                <div className="font-semibold mb-3 text-gray-900">Next payments</div>
                <div className="space-y-4 text-sm text-gray-900">
                  {nextPayments.map((p, idx) => (
                    <div key={idx}>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-xs text-gray-600">Charge date: {p.chargeDate}</div>
                          <div className="text-gray-900">{p.coverage}</div>
                        </div>
                        <div>€{p.amount.toLocaleString('de-DE', { maximumFractionDigits: 0, minimumFractionDigits: 0 })}</div>
                      </div>
                      {/* VAT removed; totals equal amount */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          

          
        </div>
      </section>
      <Footer />
    </main>
  )
}


