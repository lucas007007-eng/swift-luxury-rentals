"use client"

import React, { useState, useEffect } from 'react'

export default function SimpleTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [sessionStart, setSessionStart] = useState<number>(Date.now())
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [isActive, setIsActive] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editHours, setEditHours] = useState(0)

  // Load total seconds from localStorage on mount - FORCE UPDATE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force update: Clear old data and set new baseline
      localStorage.removeItem('simple_timer_total_seconds')
      
      // Set new baseline: 47h 51m 40s + today's session (6 hours) = 53h 51m 40s  
      const todaysWork = 6 * 3600 // Today's intensive work: filters, cache, troubleshooting
      const baseline = (47 * 3600) + (51 * 60) + 40 + todaysWork
      
      setTotalSeconds(baseline)
      setEditHours(Math.floor(baseline / 3600))
      localStorage.setItem('simple_timer_total_seconds', String(baseline))
      
      console.log(`[TIMER] Forced update to ${Math.floor(baseline / 3600)} hours (${baseline} seconds)`)
      setSessionStart(Date.now())
    }
  }, [])

  // Track user activity
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleActivity = () => {
      setLastActivity(Date.now())
      setIsActive(true)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'click']
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [])

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = (now - lastActivity) / 1000

      // Stop if idle for 1+ minute
      if (timeSinceActivity > 60) {
        setIsActive(false)
        return
      }

      // Add 1 second if active
      if (isActive) {
        setTotalSeconds(prev => {
          const newTotal = prev + 1
          // Save to localStorage every 10 seconds
          if (newTotal % 10 === 0) {
            localStorage.setItem('simple_timer_total_seconds', String(newTotal))
          }
          return newTotal
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastActivity, isActive])

  // Save exact time on page unload
  useEffect(() => {
    const saveOnUnload = () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('simple_timer_total_seconds', String(totalSeconds))
      }
    }

    window.addEventListener('beforeunload', saveOnUnload)
    return () => window.removeEventListener('beforeunload', saveOnUnload)
  }, [totalSeconds])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const promptingSeconds = Math.floor(totalSeconds / 3)
  const codingSeconds = Math.floor((totalSeconds * 2) / 3)

  return (
    <div className="relative rounded-2xl p-6 border border-amber-400/40 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_25px_rgba(245,158,11,0.3)] overflow-hidden flex-1">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(245,158,11,0.1)_1px,transparent_1px),linear-gradient(rgba(245,158,11,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
      </div>
      
      {/* Glowing corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60" />
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono uppercase tracking-wider text-lg text-amber-400 font-bold">Development Timer</div>
            <div className="text-amber-200/80 text-sm">Swift Luxury build time tracking</div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-amber-400/70 hover:text-amber-300 text-xs px-2 py-1 border border-amber-400/30 rounded"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newTotal = editHours * 3600
                  setTotalSeconds(newTotal)
                  localStorage.setItem('simple_timer_total_seconds', String(newTotal))
                  setIsEditing(false)
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-amber-400/70 hover:text-amber-300 text-xs px-2 py-1 border border-amber-400/30 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-xs text-amber-200/80 font-mono">
                {isActive ? 'TRACKING ACTIVE' : 'IDLE (1min timeout)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Prompting Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Prompting</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTime(promptingSeconds)}
                </div>
                <div className="text-xs text-amber-200/60">Human direction</div>
              </div>

              {/* Coding Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Coding</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTime(codingSeconds)}
                </div>
                <div className="text-xs text-amber-200/60">AI implementation</div>
              </div>

              {/* Total Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Total</div>
                <div className="text-3xl font-mono font-bold text-amber-300 mb-1 glow-text">
                  {formatTime(totalSeconds)}
                </div>
                <div className="text-xs text-amber-200/60">Build time</div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-amber-300/80 uppercase tracking-wider mb-1">Total Hours</label>
            <input
              type="number"
              step="1"
              value={editHours}
              onChange={(e) => setEditHours(Number(e.target.value) || 0)}
              className="w-full bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-amber-300 font-mono"
            />
          </div>
        )}

        {/* Animated progress bar */}
        <div className="mt-4 h-1 bg-amber-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 relative"
            style={{ width: `${Math.min(100, (totalSeconds / 360000) * 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        
        <div className="mt-2 text-center text-xs text-amber-200/60">
          Auto-tracking: 1:2 prompting:coding ratio • {totalSeconds > 0 ? Math.round((720 * 3600 / totalSeconds) * 10) / 10 : 0}x faster than traditional
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
        .glow-text {
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </div>
  )
}
