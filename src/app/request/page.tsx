'use client'

import React, { useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export const dynamic = 'force-dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cityProperties } from '@/data/cityProperties'

export default function RequestToBook() {
  const params = useSearchParams()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const id = params.get('id') || ''
  const title = params.get('title') || 'Your stay'
  const img = decodeURIComponent(params.get('img') || '')
  const checkin = params.get('checkin') || ''
  const checkout = params.get('checkout') || ''
  const nightsParam = Number(params.get('nights') || '0')
  const subtotalParam = Number(params.get('subtotal') || '0')

  const [subtotalCalc, setSubtotalCalc] = useState<number | null>(null)
  const [paidByCompany, setPaidByCompany] = useState<boolean>(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card')
  const [paymentOption, setPaymentOption] = useState<'monthly' | 'full'>('monthly')
  const [cryptoCurrency, setCryptoCurrency] = useState<'ETH' | 'USDT' | 'BTC'>('ETH')
  const [copied, setCopied] = useState<boolean>(false)
  const [calendarState, setCalendarState] = useState<Record<string, any>>({})
  const [payNowInfo, setPayNowInfo] = useState<{ from: string, to: string, amount: number } | null>(null)
  const [nextPayments, setNextPayments] = useState<Array<{ chargeDate: string, coverage: string, amount: number }>>([])
  const [monthlyRent, setMonthlyRent] = useState<number>(0)
  const [damageDeposit, setDamageDeposit] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(0.15)
  const [moveInFeeDue, setMoveInFeeDue] = useState<number>(250)

  // Feature flag: disable payment UI for testing/GitHub
  const paymentsEnabled = (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === '1' || process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === '1')

  // Contact state (prefilled for signed-in users)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  const callbackUrl = useMemo(() => {
    try {
      const qs = params?.toString?.() || ''
      const rel = `${pathname || '/request'}${qs ? `?${qs}` : ''}`
      if (typeof window !== 'undefined') return window.location.href
      return rel
    } catch {
      return '/request'
    }
  }, [params, pathname])

  useEffect(() => {
    try {
      const name = session?.user?.name || ''
      const [fn, ...rest] = name.split(' ')
      const ln = rest.join(' ')
      if (name) {
        setFirstName((v)=> v || fn)
        setLastName((v)=> v || ln)
      }
      const em = session?.user?.email || ''
      if (em) setEmailInput((v)=> v || em)
      // phone may not be present in session; leave as-is
    } catch {}
  }, [session])

  // Submit UI states for animated modal
  const [submitStage, setSubmitStage] = useState<'idle'|'progress'|'received'>('idle')

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
      // Helpers that mirror admin pricing rules
      const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
      const toUTC = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      const nextMonthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
      const monthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
      const nightsBetween = (a: Date, b: Date) => Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000))

      const calcAmountForRange = (start: Date, endExclusive: Date): number => {
        // Break into month segments; full months = exact monthly, partial = nights * ceil(monthly/daysInMonth)
        let cursor = toUTC(start)
        const endUTC = toUTC(endExclusive)
        let amount = 0
        while (cursor < endUTC) {
          const segMonthStart = monthStart(cursor)
          const segNextMonthStart = nextMonthStart(cursor)
          const segEnd = endUTC < segNextMonthStart ? endUTC : segNextMonthStart
          const isFull = cursor.getTime() === segMonthStart.getTime() && segEnd.getTime() === segNextMonthStart.getTime()
          if (isFull) {
            amount += Math.round(monthlyFromData)
          } else {
            const nights = nightsBetween(cursor, segEnd)
            const dim = daysInMonth(cursor.getUTCFullYear(), cursor.getUTCMonth())
            const nightlyRounded = Math.ceil((monthlyFromData / dim) || 0)
            amount += nights * nightlyRounded
          }
          cursor = segEnd
        }
        return amount
      }

      // Subtotal across entire stay with the rule set above
      const totalSum = calcAmountForRange(s, e)
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
      const firstAmount = calcAmountForRange(s, firstPeriodEndExclusive)
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
      // Enable Next payments if the stay crosses month boundaries (more than first period)
      const crossesMonthBoundary = e > firstPeriodEndExclusive
      const overTwoMonths = crossesMonthBoundary
      // Waive move-in fee for stays under 30 days (will be handled in component)
      if (overTwoMonths) {
        // Next payments start on the 1st following the first period end
        for (let ms = new Date(firstPeriodEndExclusive.getFullYear(), firstPeriodEndExclusive.getMonth(), 1); ms < e; ms = new Date(ms.getFullYear(), ms.getMonth() + 1, 1)) {
          const nm = new Date(ms.getFullYear(), ms.getMonth() + 1, 1)
          const end = e < nm ? e : nm
          if (ms >= end) break
          // Full month => exact monthly; else partial => nights * ceil(monthly/dim)
          const isFull = ms.getDate() === 1 && end.getTime() === nm.getTime()
          let amt = 0
          if (isFull) {
            amt = Math.round(monthlyFromData)
          } else {
            const a = toUTC(ms); const b = toUTC(end)
            const nights = nightsBetween(a, b)
            // Use same logic as listing calendar: monthly rate ÷ 30 days
            const nightlyRate = Math.round((monthlyFromData / 30) || 0)
            amt = nights * nightlyRate
          }
          const chargeDate = formatDate(ms)
          const endLessOne = new Date(end.getTime() - 86400000)
          const coverage = `${ms.toLocaleDateString('en-US', { month: 'short' })} 1 - ${ms.toLocaleDateString('en-US', { month: 'short' })} ${String(endLessOne.getDate()).padStart(2,'0')}`
          payments.push({ chargeDate, coverage, amount: amt })
        }
      }
      setNextPayments(payments)
    })()
  }, [id, checkin, checkout])

  const subtotal = subtotalCalc ?? subtotalParam
  const moveInFee = 250
  const nights = nightsParam || (checkin && checkout ? Math.max(0, Math.round((new Date(checkout).getTime()-new Date(checkin).getTime())/86400000)) : 0)
  
  // Calculate move-in fee based on stay duration
  const actualMoveInFee = nights < 30 ? 0 : moveInFee
  const total = (Math.round(((subtotal + actualMoveInFee)) * 100) / 100)

  return (
    <main className="min-h-screen bg-black">
      <Header forceBackground={true} />
      <section className="pt-28 pb-20">
        <div className="max-w-7xl xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Book Your Stay</h1>
            <p className="text-gray-400 text-sm md:text-base">Complete your reservation details below</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
            {/* Left: Property Details & Payment Options */}
            <div className="space-y-8">
            {/* Property Overview */}
            <div className="bg-gray-900 rounded-2xl p-4 md:p-8 border border-gray-800">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start mb-6 md:mb-8">
                <div className="w-full md:w-32 h-32 md:h-32 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  {img ? (
                    <img 
                      src={img} 
                      alt={title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', img)
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${img ? 'hidden' : ''}`}>
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-2 leading-tight">{title}</h2>
                  <div className="text-gray-400 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-sm md:text-base">Berlin, Germany</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-4 text-xs md:text-sm">
                      <span className="flex items-center gap-1">🛏️ <span>8 guests</span></span>
                      <span className="flex items-center gap-1">🛁 <span>4 bedrooms</span></span>
                      <span className="flex items-center gap-1">🚿 <span>3 bathrooms</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300">
                      {checkin} → {checkout}
                    </div>
                    <div className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300">
                      {nights} nights
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Options Toggle (hidden in test mode) */}
              {paymentsEnabled ? (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Payment Options</h3>
                  <div className="bg-gray-800 p-1 rounded-xl flex">
                    <button 
                      onClick={() => setPaymentOption('full')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        paymentOption === 'full' 
                          ? 'bg-white text-black' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Pay Now in Full
                      <div className={`text-xs mt-1 ${paymentOption === 'full' ? 'text-gray-600' : 'text-gray-500'}`}>
                        €{Math.round(subtotal + actualMoveInFee + damageDeposit).toLocaleString('de-DE')} at booking completion
                      </div>
                    </button>
                    <button 
                      onClick={() => setPaymentOption('monthly')}
                      className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        paymentOption === 'monthly' 
                          ? 'bg-white text-black' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Pay Monthly
                      <div className={`text-xs mt-1 ${paymentOption === 'monthly' ? 'text-gray-600' : 'text-gray-500'}`}>
                        €{(payNowInfo?.amount ?? 0).toLocaleString('de-DE')} now + scheduled payments
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <div className="p-4 rounded-xl border border-amber-400/30 bg-amber-500/10 text-amber-200 text-sm">
                    Payments are disabled in test mode. You can submit booking requests without payment.
                  </div>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">Contact Details</h3>
              
              {status === 'unauthenticated' ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">Sign in to continue</h4>
                    <p className="text-gray-400 mb-6">Have an account? Sign in to auto-fill your details and track your booking.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link 
                      href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} 
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} 
                      className="w-full sm:w-auto px-8 py-3 rounded-xl border border-amber-400/40 text-amber-200 font-semibold hover:bg-amber-400/10 transition-colors text-center"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">First name</label>
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Last name</label>
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="Doe" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2">Email</label>
                  <input value={emailInput} onChange={(e)=>setEmailInput(e.target.value)} type="email" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="you@example.com" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2">Phone</label>
                  <div className="flex gap-2 md:gap-3">
                    <select className="w-20 md:w-28 bg-gray-800 border border-gray-700 rounded-xl px-2 md:px-3 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm md:text-base">
                      <option>+49</option>
                      <option>+34</option>
                      <option>+33</option>
                      <option>+39</option>
                      <option>+44</option>
                    </select>
                    <input value={phoneInput} onChange={(e)=>setPhoneInput(e.target.value)} className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-xl px-3 md:px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors text-sm md:text-base" placeholder="Phone number" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-300 mb-2">Residence country</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors">
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
              )}
            </div>

            {/* Payment Method (hidden in test mode) */}
            {paymentsEnabled && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">Payment Method</h3>
              <div className="flex items-center gap-6 mb-6">
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="paymethod" className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500" checked={paymentMethod==='card'} onChange={() => setPaymentMethod('card')} />
                  <span className="text-white text-sm font-medium">Card</span>
                </label>
                <label className="inline-flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="paymethod" className="w-4 h-4 text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500" checked={paymentMethod==='crypto'} onChange={() => setPaymentMethod('crypto')} />
                  <span className="text-white text-sm font-medium">Crypto</span>
                </label>
              </div>
              
              {paymentMethod === 'crypto' && (
                <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="text-xs text-amber-400">Crypto payments are held in escrow for up to 72hrs. If booking is not approved, full refund is issued automatically.</div>
                </div>
              )}
              
              {paymentMethod === 'card' && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="text-xs text-blue-400">Credit Card will not be charged until your booking is Confirmed. You will receive an update within 24hrs!</div>
              </div>
              )}

              {paymentMethod === 'card' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">Cardholder name</label>
                      <input className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="Name on card" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-300 mb-2">Card number</label>
                      <input className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Expiry</label>
                      <input className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">CVC</label>
                      <input className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" placeholder="CVC" />
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
            )}

            {/* Terms & Complete Booking */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-6">Review your request</h3>
              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-1 text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500 rounded" />
                  <span className="text-gray-300 text-sm">I agree to the Terms of Service, Sublease Agreement and Cancellation Policy and understand that this reservation is contingent on successfully passing tenant screening.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-1 text-amber-500 bg-gray-800 border-gray-600 focus:ring-amber-500 rounded" />
                  <span className="text-gray-300 text-sm">I agree to the Privacy Policy.</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Your Stay Summary */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 h-max">
            <h3 className="text-2xl font-bold text-white mb-6">Your Stay</h3>
            
            <div className="flex gap-4 items-start mb-8">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                {img ? (
                  <img 
                    src={img} 
                    alt={title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${img ? 'hidden' : ''}`}>
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white text-sm mb-1 truncate">{title}</div>
                <div className="text-gray-400 text-xs mb-2">{checkin} - {checkout}</div>
                <div className="text-gray-300 text-xs">{nights} nights • 1 Guest</div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4">Pricing Breakdown</h4>
              
              {paymentOption === 'monthly' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">First period rent</span>
                    <span className="text-white font-medium">€{(payNowInfo?.amount ?? 0).toLocaleString('de-DE')}</span>
                  </div>
                  {actualMoveInFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Move-in fee</span>
                      <span className="text-white font-medium">€{actualMoveInFee.toLocaleString('de-DE')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Refundable Damage Deposit</span>
                    <span className="text-white font-medium">€{damageDeposit.toLocaleString('de-DE')}</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Due today:</span>
                      <span className="text-white text-xl font-bold">€{Math.round((payNowInfo?.amount ?? 0) + actualMoveInFee + damageDeposit).toLocaleString('de-DE')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Total Stay Price:</span>
                      <span className="text-white text-lg font-semibold">€{Math.round(subtotal + actualMoveInFee + damageDeposit).toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Total Stay Rent</span>
                    <span className="text-white font-medium">€{subtotal.toLocaleString('de-DE')}</span>
                  </div>
                  {actualMoveInFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Move-in fee</span>
                      <span className="text-white font-medium">€{actualMoveInFee.toLocaleString('de-DE')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">Refundable Damage Deposit</span>
                    <span className="text-white font-medium">€{damageDeposit.toLocaleString('de-DE')}</span>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-lg font-semibold">Total now</span>
                      <span className="text-white text-xl font-bold">€{Math.round(subtotal + actualMoveInFee + damageDeposit).toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Next Payments - Clean design matching image */}
            {paymentOption === 'monthly' && nextPayments.length > 0 && (
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-4">Next Payments</h4>
                <div className="space-y-2">
                  {nextPayments.map((p, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-400 text-xs">Charge date: {p.chargeDate}</div>
                          <div className="text-white font-medium text-sm">{p.coverage}</div>
                        </div>
                        <div className="text-white font-semibold">€{p.amount.toLocaleString('de-DE')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Complete Booking Button */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              {status === 'unauthenticated' ? (
                <button 
                  onClick={() => setShowLoginPrompt(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/25"
                >
                  Sign in to Complete Booking
                </button>
              ) : (
                <button 
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-amber-500/25"
                  onClick={async()=>{
                try {
                setSubmitStage('progress')
                // Always log a local application entry for instant UX in dev
                try {
                  const key = 'test_applications_v1'
                  const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
                  const arr = raw ? JSON.parse(raw) : []
                  const app = {
                    id: `local-${Date.now()}`,
                    propertyTitle: title,
                    propertyId: id,
                    propertyExtId: id,
                    coverImage: img,
                    checkIn: checkin,
                    checkOut: checkout,
                    status: 'hold',
                    totalCents: Math.round(((payNowInfo?.amount ?? subtotal) + actualMoveInFee + damageDeposit) * 100),
                    estimatedTotalCents: Math.round(((subtotal) + actualMoveInFee + damageDeposit) * 100),
                    location: '—',
                    bedrooms: null,
                    bathrooms: null,
                    payments: [],
                    receivedCents: 0,
                  }
                  const next = [app, ...(Array.isArray(arr) ? arr : [])].slice(0, 10)
                  localStorage.setItem(key, JSON.stringify(next))
                } catch {}
                // Always attempt to persist booking with hold status in backend (can be disabled via FEATURE_DB_BOOKINGS=0)
                {
                    const payload = {
                      propertyId: id,
                    user: { name: `${firstName} ${lastName}`.trim() || 'Guest', email: emailInput || session?.user?.email || '', phone: phoneInput || '' },
                      checkIn: checkin,
                      checkOut: checkout,
                        totalCents: Math.round(((payNowInfo?.amount ?? subtotal) + actualMoveInFee + damageDeposit) * 100)
                    }
                    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
                    if (res.ok) {
                      console.log('Booking created in DB')
                    } else {
                      console.warn('DB booking disabled or failed; proceeding without DB persistence')
                    }
                  }
                // (Optional) we could later de-duplicate/replace the local entry once the server booking succeeds
                // Progress → Received → redirect
                setTimeout(()=>{
                  setSubmitStage('received')
                  setTimeout(()=>{ window.location.href = '/dashboard?tab=applications' }, 1400)
                }, 2000)
                } catch(e) {
                  console.warn('Booking API error; proceeding without DB persistence')
                  setSubmitStage('received')
                  setTimeout(()=>{ window.location.href = '/dashboard?tab=applications' }, 1000)
                }
                }}
              >
                {paymentsEnabled ? 'Complete Booking' : 'Submit Request'}
              </button>
              )}
              {paymentsEnabled && status === 'authenticated' ? (
                <div className="text-center mt-3">
                  <div className="text-xs text-gray-400">Powered by <span className="text-white font-medium">Stripe</span></div>
                </div>
              ) : null}
            </div>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-amber-400/30 rounded-2xl p-8 max-w-md w-full text-center">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Account Required</h3>
                  <p className="text-gray-400 mb-6">Please sign in or create an account to complete your booking and track your reservation.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors text-center"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                      className="flex-1 px-6 py-3 border border-amber-400/40 text-amber-200 font-semibold rounded-xl hover:bg-amber-400/10 transition-colors text-center"
                    >
                      Create Account
                    </Link>
          </div>
                  <button 
                    onClick={() => setShowLoginPrompt(false)}
                    className="mt-4 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
              </div>
              </div>
            )}
            </div>
                        </div>
                      </div>
      </section>
      <Footer />

      {/* Submit modal animation */}
      {submitStage !== 'idle' && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black border border-amber-500/40 rounded-2xl px-8 py-10 text-center shadow-2xl w-[360px]">
            {submitStage === 'progress' ? (
              <>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                <div className="text-amber-300 font-semibold">Request progressing…</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-green-300 font-semibold mb-1">Request received</div>
                <div className="text-white/80 text-sm">You will hear from our team within 24hrs!</div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}


