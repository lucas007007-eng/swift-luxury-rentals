'use client'

import React, { useState } from 'react'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    if (!email) { setError('Please enter your email'); return }
    const res = await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reason, source: 'link' })
    })
    if (res.ok) setDone(true)
    else setError('Something went wrong. Please try again later.')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl">
        {done ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">You’re unsubscribed</h1>
            <p className="text-gray-400">We’ve recorded your preference. You can resubscribe anytime.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">Manage email preferences</h1>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-3 py-2 rounded bg-white text-gray-900" />
            <label className="block text-sm text-gray-300 mt-4 mb-2">Reason (optional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Too many emails, not relevant, etc." className="w-full px-3 py-2 rounded bg-white text-gray-900" />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <div className="mt-6 flex gap-2">
              <button onClick={submit} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg">Unsubscribe</button>
              <a href="/" className="px-4 py-2 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-800">Go Home</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


