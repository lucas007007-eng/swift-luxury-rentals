'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useRive, Layout, Fit, Alignment, useStateMachineInput } from '@rive-app/react-canvas'

type Props = {
  value?: number
  onChange?: (days: number) => void
  riveSrc?: string
  stateMachineName?: string
}

const steps = [3, 7, 14, 30, 60, 90]
const ARC_START_DEG = -140
const ARC_SWEEP_DEG = 280

export default function DurationSelector({ value, onChange, riveSrc = '/animations/airbnb-duration.riv', stateMachineName = 'controller' }: Props) {
  const [internal, setInternal] = useState<number>(value ?? 14)
  const idx = useMemo(() => Math.max(0, steps.indexOf(internal)), [internal])

  const handleIdxChange = (i: number) => {
    const days = steps[i]
    setInternal(days)
    onChange?.(days)
  }

  // Rive integration (uses .riv when present)
  const [riveLoaded, setRiveLoaded] = useState(false)
  const { rive, RiveComponent } = useRive({
    src: riveSrc,
    autoplay: true,
    stateMachines: stateMachineName,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: () => setRiveLoaded(true)
  })
  const indexIn = useStateMachineInput(rive, stateMachineName, 'index')
  const indexOut = useStateMachineInput(rive, stateMachineName, 'index_out')

  // push to Rive
  useEffect(() => { if (indexIn) indexIn.value = idx }, [idx, indexIn])
  // pull from Rive (optional)
  useEffect(() => {
    if (!indexOut) return
    const t = setInterval(() => {
      const i = Number(indexOut.value)
      if (!Number.isNaN(i) && i >= 0 && i < steps.length && steps[i] !== internal) handleIdxChange(i)
    }, 50)
    return () => clearInterval(t)
  }, [indexOut])

  return (
    <div className="bg-black/30 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">Duration of Rental</div>
        <div className="text-amber-400 text-sm font-semibold">{internal} {internal === 1 ? 'day' : 'days'}</div>
      </div>

      <div className="rounded-lg overflow-hidden bg-black/40 border border-gray-800 mb-4">
        {riveLoaded && RiveComponent ? (
          <RiveComponent className="w-full h-56" />
        ) : (
          <div className="h-56 grid place-items-center text-white/60">Add airbnb-duration.riv</div>
        )}
      </div>

      <div className="px-1">
        <input type="range" min={0} max={steps.length - 1} step={1} value={idx} onChange={(e) => handleIdxChange(Number(e.target.value))} className="w-full accent-amber-500" />
        <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
          {steps.map(d => (<div key={d} className="text-center text-[11px] text-white/60">{d}d</div>))}
        </div>
      </div>
    </div>
  )
}


