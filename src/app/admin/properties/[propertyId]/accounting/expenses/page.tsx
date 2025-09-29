'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Expense = {
  id: string
  amount: number
  description: string
  date: string
  categoryName: string
  categoryType: string
  status: string
  isRecurring: boolean
  receiptUrl?: string
}

export default function PropertyExpensesPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.propertyId as string
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [property, setProperty] = useState<any>(null)

  // Form state for adding expenses
  const [form, setForm] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringType: 'monthly',
    status: 'pending'
  })

  useEffect(() => {
    if (propertyId) {
      loadExpenses()
      loadCategories()
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

  const loadExpenses = async () => {
    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/expenses`)
      if (res.ok) setExpenses(await res.json())
    } catch (e) {
      console.error('Failed to load expenses:', e)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/finance/expense-categories')
      if (res.ok) setCategories(await res.json())
    } catch (e) {
      console.error('Failed to load categories:', e)
    }
  }

  const handleAddExpense = async () => {
    if (!form.description || !form.amount || !form.categoryId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const res = await fetch(`/api/admin/finance/properties/${propertyId}/expenses`, {
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
          description: '',
          amount: '',
          categoryId: '',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false,
          recurringType: 'monthly',
          status: 'pending'
        })
        loadExpenses() // Refresh list
        alert('✅ Expense added successfully!')
      } else {
        alert('❌ Failed to add expense')
      }
    } catch (e) {
      console.error('Add expense error:', e)
      alert('❌ Failed to add expense')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true
    if (filter === 'recurring') return expense.isRecurring
    return expense.categoryType === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
      case 'approved': return 'border-cyan-400/30 bg-cyan-500/10 text-cyan-300'
      default: return 'border-amber-400/30 bg-amber-500/10 text-amber-300'
    }
  }

  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      setup: 'border-purple-400/30 bg-purple-500/10 text-purple-300',
      renovation: 'border-orange-400/30 bg-orange-500/10 text-orange-300',
      fixed: 'border-red-400/30 bg-red-500/10 text-red-300',
      recurring: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
      operational: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-300',
      guest: 'border-pink-400/30 bg-pink-500/10 text-pink-300'
    }
    return colors[type] || 'border-gray-400/30 bg-gray-500/10 text-gray-300'
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
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Expenses</div>
            <h1 className="text-2xl md:text-3xl font-bold heading-sora text-white">{property?.title || 'Property'} Expenses</h1>
            <p className="text-zinc-300 text-sm">Track & Categorize Property Costs</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
            >
              + Add Expense
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pb-10">
        {/* Filter Bar */}
        <div className="luxury-feature-card p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {['all', 'setup', 'renovation', 'fixed', 'recurring', 'operational', 'guest'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${
                  filter === type
                    ? 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105'
                    : 'border-zinc-400/30 text-zinc-400 hover:text-white hover:border-zinc-300/40'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="luxury-feature-card overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Property Expenses</h2>
            <p className="text-zinc-400 text-sm mt-1">{filteredExpenses.length} expenses found</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Description</th>
                  <th className="text-left py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Category</th>
                  <th className="text-right py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Amount</th>
                  <th className="text-center py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Status</th>
                  <th className="text-center py-4 px-6 text-zinc-300 text-sm font-mono uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length: 5}).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td colSpan={6} className="py-6 text-center">
                        <div className="animate-pulse bg-gray-800/50 rounded h-4 mx-auto" style={{width: `${60 + i * 10}%`}}></div>
                      </td>
                    </tr>
                  ))
                ) : filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      No expenses found. Add your first expense to get started.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white text-sm">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-white">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          {expense.isRecurring && (
                            <div className="text-xs text-cyan-300 mt-1">🔄 Recurring</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-lg text-xs border ${getCategoryColor(expense.categoryType)}`}>
                          {expense.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-white font-semibold">
                        €{expense.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs border ${getStatusColor(expense.status)}`}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="inline-flex items-center px-2 py-1 rounded text-xs border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition-all">
                            Edit
                          </button>
                          {expense.receiptUrl && (
                            <a href={expense.receiptUrl} target="_blank" className="inline-flex items-center px-2 py-1 rounded text-xs border border-purple-400/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all">
                              Receipt
                            </a>
                          )}
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

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="luxury-feature-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Expense</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="e.g., Monthly cleaning service"
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
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Category *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({...form, categoryId: e.target.value})}
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-zinc-300 pt-6">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm({...form, isRecurring: e.target.checked})}
                      className="accent-cyan-400"
                    />
                    Recurring expense
                  </label>
                </div>
              </div>

              {form.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Recurring Type</label>
                  <select
                    value={form.recurringType}
                    onChange={(e) => setForm({...form, recurringType: e.target.value})}
                    className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={handleAddExpense}
                className="inline-flex items-center px-6 py-3 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300"
              >
                💰 Add Expense
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