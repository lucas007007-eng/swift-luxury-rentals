'use client'

import React, { useMemo, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
const Calendar = dynamic(() => import('./Calendar'), { ssr: false })
import { useParams, useRouter } from 'next/navigation'
import { cityProperties } from '@/data/cityProperties'

function getPropertyById(id: string) {
  for (const city in cityProperties) {
    const found = cityProperties[city].find(p => p.id === id)
    if (found) return { city, property: found }
  }
  return { city: '', property: null as any }
}

export default function AdminPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { city, property } = useMemo(()=>getPropertyById(id), [id])

  const [title, setTitle] = useState(property?.title || '')
  const [description, setDescription] = useState(property?.description || '')
  const [price, setPrice] = useState<number | ''>(property?.price || '')
  const [images, setImages] = useState<string[]>(property?.images || [])

  const [calendar, setCalendar] = useState<Record<string, {priceNight?: number; priceMonth?: number; available?: boolean}>>({})
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || [])
  const [houseRules, setHouseRules] = useState<string[]>([])
  const [houseRulesStructured, setHouseRulesStructured] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: string[];
    safety?: string[];
    cancellation?: string[];
  }>({})
  const [showPublished, setShowPublished] = useState(false)

  useEffect(()=>{
    ;(async()=>{
      const res = await fetch('/api/admin/overrides')
      const data = await res.json().catch(()=>({}))
      const o = data?.[id] || {}
      setCalendar(o.calendar || {})
      if (Array.isArray(o.amenities)) setAmenities(o.amenities)
      if (Array.isArray(o.houseRules)) setHouseRules(o.houseRules)
      if (o.houseRulesStructured) setHouseRulesStructured(o.houseRulesStructured)
    })()
  }, [id])

  const saveOverrides = async () => {
    const body = { [id]: { calendar, title, description, price, amenities, houseRules, houseRulesStructured } }
    await fetch('/api/admin/overrides', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  }

  const publishOverrides = async () => {
    await saveOverrides()
    setShowPublished(true)
    // Trigger confetti
    spawnConfetti()
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10 space-y-6">
        <button onClick={()=>router.back()} className="text-amber-400">← Back</button>
        <h1 className="text-2xl font-bold">Edit Property</h1>

        {/* Basic info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Description</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/80 mb-1">Monthly Rate (€)</label>
              <input type="number" value={price} onChange={e=>setPrice(Number(e.target.value)||'')} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
          </div>
        </div>

        {/* Images manager */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Listing Images</h2>
            <div className="text-white/60 text-sm">PNG or JPG</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((src, idx) => (
              <div key={idx} className="relative group">
                <img src={src} alt={`img-${idx}`} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={()=>setImages(prev=>prev.filter((_,i)=>i!==idx))}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded"
                >Remove</button>
              </div>
            ))}
          </div>
          <form onSubmit={async (e)=>{
            e.preventDefault()
            const input = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)
            if (!input?.files?.[0]) return
            const fd = new FormData()
            fd.append('file', input.files[0])
            fd.append('filename', input.files[0].name)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
            const data = await res.json()
            if (data?.url) setImages(prev=>[...prev, data.url])
            input.value = ''
          }} className="flex items-center gap-3">
            <input name="file" type="file" accept="image/png,image/jpeg" className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-600" />
            <button type="submit" className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded border border-white/20">Upload</button>
          </form>
        </div>

        {/* Amenities & House Rules editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities.map((a, i) => (
                <span key={i} className="bg-black/50 border border-white/10 rounded-full px-3 py-1 text-sm flex items-center gap-2">
                  {a}
                  <button onClick={()=>setAmenities(prev=>prev.filter((_,idx)=>idx!==i))} className="text-white/50 hover:text-white">✕</button>
                </span>
              ))}
            </div>
            <AmenityInput onAdd={(val)=>setAmenities(prev=>[...prev, val])} placeholder="Add amenity (e.g., Air conditioning)" />
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-3">House Rules (Public Sections)</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Check In Time</label>
                  <input value={houseRulesStructured.checkIn ?? '3:00 PM'} onChange={e=>setHouseRulesStructured(prev=>({ ...prev, checkIn: e.target.value }))} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Check Out Time</label>
                  <input value={houseRulesStructured.checkOut ?? '11:00 AM'} onChange={e=>setHouseRulesStructured(prev=>({ ...prev, checkOut: e.target.value }))} className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
                </div>
              </div>
              <RulesListEditor title="Guests" list={houseRulesStructured.guests ?? ['Children allowed','Infants allowed','No pets allowed']} onChange={(list)=>setHouseRulesStructured(prev=>({ ...prev, guests: list }))} />
              <RulesListEditor title="Safety" list={houseRulesStructured.safety ?? ['No smoking inside','No parties/events']} onChange={(list)=>setHouseRulesStructured(prev=>({ ...prev, safety: list }))} />
              <RulesListEditor title="Cancellation" list={houseRulesStructured.cancellation ?? ['Free cancellation for 48hrs','Full refund if cancelled early']} onChange={(list)=>setHouseRulesStructured(prev=>({ ...prev, cancellation: list }))} />
            </div>
          </div>
        </div>

        {/* Calendar placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Availability & Pricing Calendar</h2>
            <div className="text-white/60 text-sm">(Month / Daily pricing coming next)</div>
          </div>
          <Calendar value={calendar} onChange={setCalendar} />
        </div>

        <div className="flex gap-3">
          <button onClick={saveOverrides} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 py-2 rounded-lg">Save Draft</button>
          <button onClick={publishOverrides} className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg border border-white/20">Publish</button>
        </div>
      </div>
      {/* Published Modal */}
      {showPublished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#0b0f14] border border-emerald-400/30 rounded-2xl p-8 max-w-md w-[92%] text-center shadow-[0_0_40px_rgba(16,185,129,0.35)]">
            <div className="text-emerald-400 font-mono tracking-widest uppercase text-sm mb-2">Successfully published, Agent 47</div>
            <div className="text-white text-lg font-semibold mb-1">Published!</div>
            <div className="text-white/80 mb-6">Front-end will reflect changes immediately.</div>
            <button
              aria-label="Confirm"
              onClick={() => {
                setShowPublished(false)
                if (city) router.push(`/admin/city/${encodeURIComponent(city)}`)
                else router.push('/admin')
              }}
              className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300/70 transition-all"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function spawnConfetti() {
  try {
    const colors = ['#f59e0b','#10b981','#3b82f6','#ef4444','#eab308']
    const count = 120
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.inset = '0'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '60'
    document.body.appendChild(container)
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      const size = Math.random()*8 + 4
      piece.className = 'confetti-piece'
      piece.style.left = Math.random()*100 + 'vw'
      piece.style.width = size + 'px'
      piece.style.height = (size*0.4) + 'px'
      piece.style.background = colors[Math.floor(Math.random()*colors.length)]
      piece.style.animationDelay = (Math.random()*0.2) + 's'
      piece.style.transform = `translateY(${-(Math.random()*20+5)}vh)`
      container.appendChild(piece)
    }
    setTimeout(()=>{
      container.remove()
    }, 2000)
  } catch {}
}

function AmenityInput({ onAdd, placeholder }: { onAdd: (val: string)=>void; placeholder: string }) {
  const [val, setVal] = useState('')
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); const v = val.trim(); if (v) { onAdd(v); setVal('') } }} className="flex items-center gap-2">
      <input value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-sm" />
      <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-3 py-2 rounded-lg text-sm">Add</button>
    </form>
  )
}

function RulesListEditor({ title, list, onChange }: { title: string; list: string[]; onChange: (l: string[])=>void }) {
  const [val, setVal] = useState('')
  return (
    <div>
      <div className="text-white/80 font-semibold mb-2">{title}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {list.map((item, i) => (
          <span key={i} className="bg-black/50 border border-white/10 rounded-full px-3 py-1 text-sm flex items-center gap-2">
            {item}
            <button onClick={()=>onChange(list.filter((_,idx)=>idx!==i))} className="text-white/50 hover:text-white">✕</button>
          </span>
        ))}
      </div>
      <form onSubmit={(e)=>{ e.preventDefault(); const v = val.trim(); if (v) { onChange([...list, v]); setVal('') } }} className="flex items-center gap-2">
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={`Add to ${title}`} className="flex-1 bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-sm" />
        <button type="submit" className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded border border-white/20">Add</button>
      </form>
    </div>
  )
}


