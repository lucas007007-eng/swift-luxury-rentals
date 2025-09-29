'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts'

type Revenue = {
  id: string
  type: string
  amount: number
  description: string
  date: string
  invoiceNumber?: string
  paymentStatus: string
  paymentMethod?: string
  bookingId?: string
  guestName?: string
}

export default function PropertyRevenuePage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.propertyId as string
  const [revenues, setRevenues] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [property, setProperty] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Form state for manual revenue entry
  const [form, setForm] = useState({
    type: 'rental',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid',
    paymentMethod: 'bank',
    invoiceNumber: ''
  })

  const revenueTypes = [
    { value: 'rental', label: 'Rental Income', icon: '🏠', color: 'emerald' },
    { value: 'deposit', label: 'Security Deposit', icon: '🛡️', color: 'cyan' },
    { value: 'cleaning', label: 'Cleaning Fee', icon: '🧹', color: 'blue' },
    { value: 'utilities', label: 'Utility Reimbursement', icon: '⚡', color: 'yellow' },
    { value: 'damages', label: 'Damage Charges', icon: '🔧', color: 'red' },
    { value: 'fees', label: 'Late Fees & Penalties', icon: '⏰', color: 'orange' },
    { value: 'other', label: 'Other Income', icon: '💰', color: 'purple' }
  ]

  useEffect(() => {
    if (propertyId) {
      loadRevenue()
      loadProperty()
    }
  }, [propertyId, selectedMonth, selectedYear])

  const loadProperty = async () => {
    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}`)
      if (res.ok) {
        const data = await res.json()
        setProperty(data.property)
      }
    } catch (e) {
      console.error('Failed to load property:', e)
    }
  }

  const loadRevenue = async () => {
    try {
      const params = new URLSearchParams()
      params.set('month', selectedMonth.toString())
      params.set('year', selectedYear.toString())
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/revenue?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setRevenues(data.revenues || [])
        setSummary(data.summary || {})
      }
    } catch (e) {
      console.error('Failed to load revenue:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRevenue = async () => {
    if (!form.description || !form.amount) {
      alert('Please fill in description and amount')
      return
    }

    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount)
        })
      })

      if (res.ok) {
        setShowAddModal(false)
        setForm({
          type: 'rental',
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          paymentStatus: 'paid',
          paymentMethod: 'bank',
          invoiceNumber: ''
        })
        loadRevenue()
        alert('✅ Revenue added successfully!')
      } else {
        alert('❌ Failed to add revenue')
      }
    } catch (e) {
      console.error('Add revenue error:', e)
      alert('❌ Failed to add revenue')
    }
  }

  const filteredRevenues = revenues.filter(revenue => {
    if (filter === 'all') return true
    return revenue.type === filter
  })

  const getTypeColor = (type: string) => {
    const typeInfo = revenueTypes.find(t => t.value === type)
    const colors: Record<string, string> = {
      emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
      cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300',
      blue: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
      yellow: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300',
      red: 'border-red-400/30 bg-red-500/10 text-red-300',
      orange: 'border-orange-400/30 bg-orange-500/10 text-orange-300',
      purple: 'border-purple-400/30 bg-purple-500/10 text-purple-300'
    }
    return colors[typeInfo?.color || 'emerald'] || 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
      case 'pending': return 'border-amber-400/30 bg-amber-500/10 text-amber-300'
      case 'overdue': return 'border-red-400/30 bg-red-500/10 text-red-300'
      default: return 'border-gray-400/30 bg-gray-500/10 text-gray-300'
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/properties/${propertyId}/accounting`}
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
          >
            ← Back to Accounting
          </Link>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Revenue</div>
            <h1 className="text-2xl md:text-3xl font-bold heading-sora text-white">{property?.title || 'Property'} Income</h1>
            <p className="text-zinc-300 text-sm">Revenue Tracking & Invoice Management</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Bond-style Month Selector */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <button 
                onClick={() => {
                  const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
                  const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
                  setSelectedMonth(newMonth)
                  setSelectedYear(newYear)
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded hover:bg-amber-500/10"
              >
                ←
              </button>
              <div className="text-white font-semibold text-sm min-w-[120px] text-center">
                {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <button 
                onClick={() => {
                  const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1
                  const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear
                  setSelectedMonth(newMonth)
                  setSelectedYear(newYear)
                }}
                className="text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded hover:bg-amber-500/10"
              >
                →
              </button>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
            >
              + Add Revenue
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="luxury-feature-card p-6 border border-emerald-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Total Revenue</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.totalRevenue || 0).toLocaleString()}
            </div>
            <div className="text-xs text-emerald-300 mt-1">{new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long' })}</div>
          </div>
          <div className="luxury-feature-card p-6 border border-cyan-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Rental Income</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.rentalIncome || 0).toLocaleString()}
            </div>
            <div className="text-xs text-cyan-300 mt-1">{summary?.bookingCount || 0} bookings</div>
          </div>
          <div className="luxury-feature-card p-6 border border-amber-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Pending Payments</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.pendingAmount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-amber-300 mt-1">{summary?.pendingCount || 0} invoices</div>
          </div>
          <div className="luxury-feature-card p-6 border border-purple-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Occupancy Rate</div>
            <div className="text-2xl font-bold text-white">
              {(summary?.occupancyRate || 0).toFixed(1)}%
            </div>
            <div className="text-xs text-purple-300 mt-1">{summary?.occupiedDays || 0} days</div>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Breakdown by Type</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full text-zinc-400">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.revenueByType || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Bar dataKey="amount" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="luxury-feature-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Revenue Timeline</h3>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full text-zinc-400">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary?.dailyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Area type="monotone" dataKey="amount" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Filter Bar */}
        <div className="luxury-feature-card p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${
                filter === 'all'
                  ? 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105'
                  : 'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'
              }`}
            >
              All Revenue
            </button>
            {revenueTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${
                  filter === type.value
                    ? 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105'
                    : 'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Table */}
        <div className="luxury-feature-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Revenue & Invoices</h2>
            <p className="text-zinc-400 text-sm mt-1">{filteredRevenues.length} revenue entries found</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Type</th>
                  <th className="text-right py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Amount</th>
                  <th className="text-center py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Status</th>
                  <th className="text-center py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Method</th>
                  <th className="text-center py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length: 5}).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={7} className="py-6 text-center">
                        <div className="animate-pulse bg-gray-800/50 rounded h-4 mx-auto" style={{width: `${60 + i * 10}%`}}></div>
                      </td>
                    </tr>
                  ))
                ) : filteredRevenues.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      No revenue found for {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ) : (
                  filteredRevenues.map(revenue => (
                    <tr key={revenue.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white text-sm">
                        {new Date(revenue.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-white">
                        <div>
                          <div className="font-medium">{revenue.description}</div>
                          {revenue.guestName && (
                            <div className="text-xs text-cyan-300 mt-1">Guest: {revenue.guestName}</div>
                          )}
                          {revenue.invoiceNumber && (
                            <div className="text-xs text-purple-300 mt-1">Invoice: {revenue.invoiceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs border ${getTypeColor(revenue.type)}`}>
                          {revenueTypes.find(t => t.value === revenue.type)?.label || revenue.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-white font-semibold">
                        €{revenue.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(revenue.paymentStatus)}`}>
                          {revenue.paymentStatus.charAt(0).toUpperCase() + revenue.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-zinc-300 text-sm">
                        {revenue.paymentMethod?.toUpperCase() || '—'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="inline-flex items-center px-2 py-1 rounded text-xs border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all">
                            Edit
                          </button>
                          <button className="inline-flex items-center px-2 py-1 rounded text-xs border border-purple-400/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all">
                            Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Revenue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="luxury-feature-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Revenue Entry</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Revenue Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {revenueTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setForm({...form, type: type.value})}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        form.type === type.value
                          ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-semibold">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="e.g., Monthly rent - September 2025"
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Amount (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Date Received *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(e) => setForm({...form, paymentStatus: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="stripe">Stripe</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({...form, invoiceNumber: e.target.value})}
                    placeholder="INV-2025-001"
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleAddRevenue}
                className="inline-flex items-center px-6 py-3 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
              >
                💰 Add Revenue
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
