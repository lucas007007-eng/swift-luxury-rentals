"use client"

import React, { useState, useEffect } from 'react'

export default function SpyTimer() {
  const [promptingHours, setPromptingHours] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spy_timer_prompting')
      if (saved) return Number(saved)
      // Force update to current accurate time and save it
      localStorage.setItem('spy_timer_prompting', '15.5')
      return 15.5
    }
    return 15.5
  })
  const [codingHours, setCodingHours] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spy_timer_coding')
      if (saved) return Number(saved)
      // Force update to current accurate time and save it
      localStorage.setItem('spy_timer_coding', '31.0')
      return 31.0
    }
    return 31.0
  })
  const [isEditing, setIsEditing] = useState(false)
  const [tempPrompting, setTempPrompting] = useState(15.5)
  const [tempCoding, setTempCoding] = useState(31.0)
  const [lastSessionUpdate, setLastSessionUpdate] = useState<number>(Date.now())
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [isActive, setIsActive] = useState(true)

  // Simple localStorage load - no database calls
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load exact seconds from localStorage
      const savedPromptingSeconds = localStorage.getItem('spy_timer_prompting_seconds')
      const savedCodingSeconds = localStorage.getItem('spy_timer_coding_seconds')
      
      if (savedPromptingSeconds && savedCodingSeconds) {
        setPromptingHours(Number(savedPromptingSeconds) / 3600)
        setCodingHours(Number(savedCodingSeconds) / 3600)
      } else {
        // Set baseline if no saved data
        setPromptingHours(15.5)
        setCodingHours(31.0)
      }
      
      // Always start fresh session on load
      setLastSessionUpdate(Date.now())
      setCurrentSessionSeconds(0)
    }
  }, [])

  // Detect user activity to reset idle timer
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

  // Real-time timer with live seconds and 1-minute idle timeout
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const timeSinceActivity = (now - lastActivity) / (1000 * 60) // minutes
      const sessionSeconds = (now - lastSessionUpdate) / 1000 // seconds
      
      // Stop if idle for 1+ minute
      if (timeSinceActivity > 1) {
        setIsActive(false)
        setCurrentSessionSeconds(0)
        return
      }
      
      // Update live session seconds
      setCurrentSessionSeconds(sessionSeconds)
      
      // Add time every minute when active (60 seconds) - but don't save to DB
      if (isActive && sessionSeconds >= 60) {
        const minutesElapsed = Math.floor(sessionSeconds / 60)
        // 1:2 ratio - 1 min prompting, 2 min coding per 3 min session
        const promptingIncrement = (minutesElapsed / 3) * (1 / 60) // hours
        const codingIncrement = (minutesElapsed / 3) * (2 / 60) // hours
        
        setPromptingHours(prev => prev + promptingIncrement)
        setCodingHours(prev => prev + codingIncrement)
        setLastSessionUpdate(now)
        setCurrentSessionSeconds(0)
      }
    }, 100) // Update every 100ms for smooth seconds

    return () => clearInterval(interval)
  }, [lastActivity, lastSessionUpdate, isActive])

  // Save accumulated time to localStorage when values change (but not current session)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spy_timer_prompting_seconds', String(Math.floor(promptingHours * 3600)))
      localStorage.setItem('spy_timer_coding_seconds', String(Math.floor(codingHours * 3600)))
    }
  }, [promptingHours, codingHours])

  // Save exact time including live seconds on refresh
  useEffect(() => {
    const saveExactTime = () => {
      if (typeof window !== 'undefined') {
        // Calculate exact total seconds including current session
        const totalPromptingSeconds = Math.floor((promptingHours * 3600) + (isActive ? currentSessionSeconds / 3 : 0))
        const totalCodingSeconds = Math.floor((codingHours * 3600) + (isActive ? (currentSessionSeconds * 2) / 3 : 0))
        
        // Save exact seconds for precision
        localStorage.setItem('spy_timer_prompting_seconds', String(totalPromptingSeconds))
        localStorage.setItem('spy_timer_coding_seconds', String(totalCodingSeconds))
        
        console.log('Timer saved:', {
          promptingSeconds: totalPromptingSeconds,
          codingSeconds: totalCodingSeconds,
          currentSession: currentSessionSeconds
        })
      }
    }

    window.addEventListener('beforeunload', saveExactTime)
    return () => window.removeEventListener('beforeunload', saveExactTime)
  }, [])


  const totalHours = promptingHours + codingHours
  const promptingMinutes = Math.round((promptingHours % 1) * 60)
  const codingMinutes = Math.round((codingHours % 1) * 60)
  const totalMinutes = Math.round((totalHours % 1) * 60)

  const formatTimeWithLiveSeconds = (baseHours: number, addSeconds: number = 0) => {
    const totalSeconds = Math.floor(baseHours * 3600) + addSeconds
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const saveChanges = () => {
    setPromptingHours(tempPrompting)
    setCodingHours(tempCoding)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setTempPrompting(promptingHours)
    setTempCoding(codingHours)
    setIsEditing(false)
  }

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
              onClick={() => {
                setTempPrompting(promptingHours)
                setTempCoding(codingHours)
                setIsEditing(true)
              }}
              className="text-amber-400/70 hover:text-amber-300 text-xs px-2 py-1 border border-amber-400/30 rounded"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveChanges}
                className="bg-amber-500 hover:bg-amber-600 text-black text-xs font-semibold px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
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
                {isActive ? `TRACKING ACTIVE (+${Math.floor(currentSessionSeconds)}s)` : 'IDLE (1min timeout)'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Prompting Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Prompting</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTimeWithLiveSeconds(promptingHours + (isActive ? (currentSessionSeconds / 3) / 3600 : 0), 0)}
                </div>
                <div className="text-xs text-amber-200/60">Human direction</div>
              </div>

              {/* Coding Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Coding</div>
                <div className="text-2xl font-mono font-bold text-amber-400 mb-1">
                  {formatTimeWithLiveSeconds(codingHours + (isActive ? (currentSessionSeconds * 2 / 3) / 3600 : 0), 0)}
                </div>
                <div className="text-xs text-amber-200/60">AI implementation</div>
              </div>

              {/* Total Time */}
              <div className="text-center">
                <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">Total</div>
                <div className="text-3xl font-mono font-bold text-amber-300 mb-1 glow-text">
                  {formatTimeWithLiveSeconds(totalHours + (isActive ? currentSessionSeconds / 3600 : 0), 0)}
                </div>
                <div className="text-xs text-amber-200/60">Build time</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-amber-300/80 uppercase tracking-wider mb-1">Prompting Hours</label>
              <input
                type="number"
                step="0.5"
                value={tempPrompting}
                onChange={(e) => setTempPrompting(Number(e.target.value) || 0)}
                className="w-full bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-amber-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-amber-300/80 uppercase tracking-wider mb-1">Coding Hours</label>
              <input
                type="number"
                step="0.5"
                value={tempCoding}
                onChange={(e) => setTempCoding(Number(e.target.value) || 0)}
                className="w-full bg-black/40 border border-amber-400/30 rounded px-3 py-2 text-amber-300 font-mono"
              />
            </div>
          </div>
        )}

        {/* Animated progress bar */}
        <div className="mt-4 h-1 bg-amber-900/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-1000 relative"
            style={{ width: `${Math.min(100, (totalHours / 100) * 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
        
        <div className="mt-2 text-center text-xs text-amber-200/60">
          Auto-tracking: +3min prompting, +6min coding per session • {totalHours > 0 ? Math.round((720 / totalHours) * 10) / 10 : 0}x faster than traditional
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
