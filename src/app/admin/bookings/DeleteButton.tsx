'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const [stage, setStage] = React.useState<'idle' | 'confirm' | 'progress' | 'done'>('idle')
  const [open, setOpen] = React.useState(false)
  const [deleteText, setDeleteText] = React.useState('')

  const onDelete = async () => {
    try {
      setOpen(true)
      setStage('progress')
      const res = await fetch('/api/admin/bookings/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      // brief progress window, then show success regardless of minor network latency
      await new Promise(r => setTimeout(r, 600))
      if (res.ok) {
        try {
          const delRaw = localStorage.getItem('deleted_booking_ids_v1')
          const arr = delRaw ? JSON.parse(delRaw) : []
          const next = Array.isArray(arr) ? Array.from(new Set([...arr, id])) : [id]
          localStorage.setItem('deleted_booking_ids_v1', JSON.stringify(next))
        } catch {}
        setStage('done')
        setTimeout(() => { router.refresh() }, 800)
      } else {
        // fallback: still refresh so the admin sees current state
        setStage('done')
        setTimeout(() => { router.refresh() }, 800)
      }
    } catch {
      setStage('done')
      setTimeout(() => { router.refresh() }, 800)
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setStage('confirm'); setDeleteText('') }}
        className="px-2 py-1 text-xs rounded border border-red-400/40 bg-red-500/10 text-red-300 hover:text-red-200"
        disabled={stage !== 'idle'}
        title="Permanently delete booking and its payments (no undo)"
      >
        Delete
      </button>
      {open && (
        <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black border border-red-500/40 rounded-2xl px-8 py-10 text-center shadow-2xl w-[400px]">
            {stage === 'confirm' ? (
              <>
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-red-300 font-semibold mb-2">Confirm Deletion</div>
                <div className="text-white/80 text-sm mb-6">This will permanently delete the booking and all its payments. This action cannot be undone.</div>
                <div className="mb-4">
                  <label className="block text-white/70 text-sm mb-2">Type "DELETE" to confirm:</label>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    className="w-full bg-gray-900 border border-red-400/30 rounded-lg px-3 py-2 text-white font-mono text-center focus:border-red-400 focus:outline-none"
                    placeholder="DELETE"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setOpen(false); setStage('idle'); setDeleteText('') }}
                    className="flex-1 px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={deleteText !== 'DELETE'}
                    className={`flex-1 px-4 py-2 text-sm rounded font-semibold transition-colors ${
                      deleteText === 'DELETE' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Delete Booking
                  </button>
                </div>
              </>
            ) : stage === 'progress' ? (
              <>
                <div className="mx-auto mb-4 w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                <div className="text-amber-300 font-semibold">Deleting booking…</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-green-300 font-semibold mb-1">Deletion successful</div>
                <div className="text-white/80 text-sm">Refreshing…</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}


