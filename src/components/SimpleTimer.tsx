"use client"

import React, { useState, useEffect, useRef } from 'react'

export default function SimpleTimer() {
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [sessionStart, setSessionStart] = useState<number>(Date.now())
  const [isEditing, setIsEditing] = useState(false)
  const [editHours, setEditHours] = useState(0)
  const totalSecondsRef = useRef(0)

  // Load total seconds from localStorage on mount - PRESERVE EXISTING TIME
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('simple_timer_total_seconds')
      
      if (saved && saved !== '0') {
        // Load existing time - NEVER override if time exists
        const savedSeconds = parseInt(saved, 10)
        if (savedSeconds > 0) {
          setTotalSeconds(savedSeconds)
          totalSecondsRef.current = savedSeconds
          setEditHours(Math.floor(savedSeconds / 3600))
          console.log(`[TIMER] Loaded existing time: ${savedSeconds} seconds (${Math.floor(savedSeconds / 3600)}h ${Math.floor((savedSeconds % 3600) / 60)}m ${savedSeconds % 60}s)`)
          setSessionStart(Date.now())
          return
        }
      }
      
      // Only set baseline if NO valid time exists
      const todaysWork = 8 * 3600 // Today's work
      const baseline = (61 * 3600) + (0 * 60) + 0 // Set to 61 hours as you mentioned
      
      setTotalSeconds(baseline)
      totalSecondsRef.current = baseline
      setEditHours(Math.floor(baseline / 3600))
      localStorage.setItem('simple_timer_total_seconds', String(baseline))
      
      console.log(`[TIMER] First time setup: ${Math.floor(baseline / 3600)} hours total`)
      setSessionStart(Date.now())
    }
  }, [])

  // Continuous timer while admin page is open - NO IDLE RULES
  useEffect(() => {
    if (typeof window === 'undefined') return

    const interval = setInterval(() => {
      // Always add 1 second while admin page is open - no idle checks
      setTotalSeconds(prev => {
        const newTotal = prev + 1
        // Update ref immediately for accurate saves
        totalSecondsRef.current = newTotal
        return newTotal
      })
    }, 1000)

    return () => {
      // Save immediately when component unmounts (page closes)
      if (typeof window !== 'undefined') {
        const currentSeconds = totalSecondsRef.current
        localStorage.setItem('simple_timer_total_seconds', String(currentSeconds))
        console.log(`[TIMER] Saved on unmount: ${currentSeconds} seconds (${Math.floor(currentSeconds / 3600)}h ${Math.floor((currentSeconds % 3600) / 60)}m ${currentSeconds % 60}s)`)
      }
      clearInterval(interval)
    }
  }, [])

  // Save only on page close/refresh
  useEffect(() => {
    const saveCurrentTime = () => {
      if (typeof window !== 'undefined') {
        const currentSeconds = totalSecondsRef.current
        localStorage.setItem('simple_timer_total_seconds', String(currentSeconds))
        console.log(`[TIMER] Saved on page close/refresh: ${currentSeconds} seconds (${Math.floor(currentSeconds / 3600)}h ${Math.floor((currentSeconds % 3600) / 60)}m ${currentSeconds % 60}s)`)
      }
    }

    // Only save on page close/refresh events
    window.addEventListener('beforeunload', saveCurrentTime)
    window.addEventListener('pagehide', saveCurrentTime)
    
    return () => {
      // Final save when cleaning up
      saveCurrentTime()
      window.removeEventListener('beforeunload', saveCurrentTime)
      window.removeEventListener('pagehide', saveCurrentTime)
    }
  }, [])

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
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-amber-200/80 font-mono">
                CONTINUOUS TRACKING
              </span>
            </div>

            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
              {/* Total Time - Featured on Mobile */}
              <div className="text-center md:order-3">
                <div className="text-sm md:text-xs text-amber-300/80 uppercase tracking-wider mb-2 md:mb-1">Total</div>
                <div className="text-4xl md:text-3xl font-mono font-bold text-amber-300 mb-2 md:mb-1 glow-text">
                  {formatTime(totalSeconds)}
                </div>
                <div className="text-sm md:text-xs text-amber-200/60">Build time</div>
              </div>

              {/* Prompting Time */}
              <div className="text-center bg-amber-900/20 rounded-lg p-3 md:p-0 md:bg-transparent md:order-1">
                <div className="text-sm md:text-xs text-amber-300/80 uppercase tracking-wider mb-1">Prompting</div>
                <div className="text-xl md:text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTime(promptingSeconds)}
                </div>
                <div className="text-xs text-amber-200/60">Human direction</div>
              </div>

              {/* Coding Time */}
              <div className="text-center bg-amber-900/20 rounded-lg p-3 md:p-0 md:bg-transparent md:order-2">
                <div className="text-sm md:text-xs text-amber-300/80 uppercase tracking-wider mb-1">Coding</div>
                <div className="text-xl md:text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTime(codingSeconds)}
                </div>
                <div className="text-xs text-amber-200/60">AI implementation</div>
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
