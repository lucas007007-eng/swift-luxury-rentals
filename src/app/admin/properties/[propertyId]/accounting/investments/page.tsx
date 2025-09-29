'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Investment = {
  id: string
  category: string
  item: string
  amount: number
  purchaseDate: string
  supplier?: string
  warrantyExpiry?: string
  depreciationRate: number
  currentValue: number
}

export default function PropertyInvestmentsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.propertyId as string
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [property, setProperty] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  // Form state for adding investments
  const [form, setForm] = useState({
    category: 'furniture',
    item: '',
    amount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    warrantyExpiry: '',
    depreciationRate: '20'
  })

  const categories = [
    { value: 'furniture', label: 'Furniture', icon: '🛋️', description: 'Sofas, beds, tables, chairs' },
    { value: 'appliances', label: 'Appliances', icon: '🏠', description: 'Refrigerator, washer, dishwasher' },
    { value: 'renovation', label: 'Renovation', icon: '🔨', description: 'Construction, repairs, upgrades' },
    { value: 'technology', label: 'Technology', icon: '📱', description: 'Smart home, WiFi, entertainment' },
    { value: 'marketing', label: 'Marketing', icon: '📸', description: 'Photography, staging, listings' },
    { value: 'legal', label: 'Legal & Setup', icon: '📋', description: 'Permits, contracts, inspections' }
  ]

  useEffect(() => {
    if (propertyId) {
      loadInvestments()
      loadProperty()
    }
  }, [propertyId])

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

  const loadInvestments = async () => {
    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/investments`)
      if (res.ok) {
        const data = await res.json()
        setInvestments(data.investments || [])
        setSummary(data.summary || {})
      }
    } catch (e) {
      console.error('Failed to load investments:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInvestment = async () => {
    if (!form.item || !form.amount) {
      alert('Please fill in item name and amount')
      return
    }

    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
          depreciationRate: parseFloat(form.depreciationRate) / 100,
          warrantyExpiry: form.warrantyExpiry || null
        })
      })

      if (res.ok) {
        setShowAddModal(false)
        setForm({
          category: 'furniture',
          item: '',
          amount: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          supplier: '',
          warrantyExpiry: '',
          depreciationRate: '20'
        })
        loadInvestments()
        alert('✅ Investment added successfully!')
      } else {
        alert('❌ Failed to add investment')
      }
    } catch (e) {
      console.error('Add investment error:', e)
      alert('❌ Failed to add investment')
    }
  }

  const filteredInvestments = investments.filter(investment => {
    if (filter === 'all') return true
    return investment.category === filter
  })

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat?.icon || '💎'
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      furniture: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
      appliances: 'border-green-400/30 bg-green-500/10 text-green-300',
      renovation: 'border-orange-400/30 bg-orange-500/10 text-orange-300',
      technology: 'border-purple-400/30 bg-purple-500/10 text-purple-300',
      marketing: 'border-pink-400/30 bg-pink-500/10 text-pink-300',
      legal: 'border-gray-400/30 bg-gray-500/10 text-gray-300'
    }
    return colors[category] || 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300'
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
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Investments</div>
            <h1 className="text-2xl md:text-3xl font-bold heading-sora text-white">{property?.title || 'Property'} Assets</h1>
            <p className="text-zinc-300 text-sm">Capital Expenditures & Equipment</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
            >
              + Add Asset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Investment Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="luxury-feature-card p-6 border border-cyan-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Total Investment</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.totalInvestment || 0).toLocaleString()}
            </div>
          </div>
          <div className="luxury-feature-card p-6 border border-emerald-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Current Value</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.currentValue || 0).toLocaleString()}
            </div>
          </div>
          <div className="luxury-feature-card p-6 border border-amber-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Total Depreciation</div>
            <div className="text-2xl font-bold text-white">
              €{(summary?.totalDepreciation || 0).toLocaleString()}
            </div>
          </div>
          <div className="luxury-feature-card p-6 border border-purple-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Assets Count</div>
            <div className="text-2xl font-bold text-white">
              {investments.length}
            </div>
          </div>
        </div>

        {/* Category Filter */}
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
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${
                  filter === cat.value
                    ? 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105'
                    : 'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Investments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({length: 6}).map((_, i) => (
              <div key={i} className="luxury-feature-card p-6 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
              </div>
            ))
          ) : filteredInvestments.length === 0 ? (
            <div className="col-span-full luxury-feature-card p-8 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-white mb-2">No Assets Found</h3>
              <p className="text-zinc-400">Add your first investment to track property assets and depreciation.</p>
            </div>
          ) : (
            filteredInvestments.map(investment => (
              <div key={investment.id} className="luxury-feature-card p-6 hover:border-cyan-400/30 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(investment.category)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{investment.item}</h3>
                      <p className="text-zinc-400 text-sm">{investment.category.charAt(0).toUpperCase() + investment.category.slice(1)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs border ${getCategoryColor(investment.category)}`}>
                    {investment.category.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Purchase Price</span>
                    <span className="text-white font-semibold">€{investment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Current Value</span>
                    <span className="text-emerald-300 font-semibold">€{investment.currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Depreciation</span>
                    <span className="text-red-300 font-semibold">{investment.depreciationRate}% / year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Purchase Date</span>
                    <span className="text-zinc-300 text-sm">{new Date(investment.purchaseDate).toLocaleDateString()}</span>
                  </div>
                  {investment.supplier && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">Supplier</span>
                      <span className="text-zinc-300 text-sm">{investment.supplier}</span>
                    </div>
                  )}
                  {investment.warrantyExpiry && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400 text-sm">Warranty Until</span>
                      <span className={`text-sm ${new Date(investment.warrantyExpiry) > new Date() ? 'text-emerald-300' : 'text-red-300'}`}>
                        {new Date(investment.warrantyExpiry).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-xs">Value Lost</span>
                    <span className="text-red-400 font-semibold">
                      €{(investment.amount - investment.currentValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Investment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="luxury-feature-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Asset</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setForm({...form, category: cat.value})}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        form.category === cat.value
                          ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-semibold">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={form.item}
                  onChange={(e) => setForm({...form, item: e.target.value})}
                  placeholder="e.g., Luxury Sofa Set, Samsung Refrigerator"
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Purchase Price (€) *</label>
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
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Purchase Date *</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setForm({...form, purchaseDate: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Supplier (Optional)</label>
                  <input
                    type="text"
                    value={form.supplier}
                    onChange={(e) => setForm({...form, supplier: e.target.value})}
                    placeholder="IKEA, Samsung, etc."
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Warranty Expiry (Optional)</label>
                  <input
                    type="date"
                    value={form.warrantyExpiry}
                    onChange={(e) => setForm({...form, warrantyExpiry: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Annual Depreciation Rate (%)</label>
                <select
                  value={form.depreciationRate}
                  onChange={(e) => setForm({...form, depreciationRate: e.target.value})}
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                >
                  <option value="10">10% (Electronics)</option>
                  <option value="15">15% (Appliances)</option>
                  <option value="20">20% (Furniture - Default)</option>
                  <option value="25">25% (Technology)</option>
                  <option value="5">5% (Renovation/Construction)</option>
                  <option value="0">0% (No Depreciation)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleAddInvestment}
                className="inline-flex items-center px-6 py-3 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
              >
                💎 Add Asset
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
