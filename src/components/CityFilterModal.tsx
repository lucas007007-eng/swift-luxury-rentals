"use client"

import React, { useEffect, useMemo, useState } from 'react'

export type CityFilterState = {
  bedrooms?: number
  bathrooms?: number
  amenities: string[]
}

export default function CityFilterModal({
  open,
  onClose,
  properties,
  onApply,
  overrides,
}: {
  open: boolean
  onClose: () => void
  properties: Array<{ id: string; bedrooms?: number; bathrooms?: number; amenities?: string[] }>
  onApply: (s: CityFilterState) => void
  overrides: Record<string, any>
}) {
  const [state, setState] = useState<CityFilterState>({ amenities: [] })

  // Calculate filtered count in real-time
  const filteredCount = useMemo(() => {
    // Amenity keyword variants (same mapping as city page)
    const getVariants = (term: string): string[] => {
      const t = term.toLowerCase()
      const variants = new Set<string>([t])
      const add = (v: string) => variants.add(v.toLowerCase())
      switch (t) {
        case 'wifi':
          ;['wi-fi','wireless','internet'].forEach(add); break
        case 'air conditioning':
          ;['ac','a/c','aircon','air-conditioner'].forEach(add); break
        case 'hot tub':
          ;['hottub','jacuzzi','whirlpool','spa'].forEach(add); break
        case 'bbq grill':
          ;['bbq','barbecue','grill'].forEach(add); break
        case 'ev charger':
          ;['electric vehicle charger','ev-charger','charging station','car charger'].forEach(add); break
        case 'smoke alarm':
          ;['smoke detector'].forEach(add); break
        case 'carbon monoxide alarm':
          ;['co alarm','carbon monoxide detector','co detector'].forEach(add); break
        case 'king bed':
          ;['king-bed','king sized bed','king size bed','king'].forEach(add); break
        case 'tv':
          ;['television','smart tv'].forEach(add); break
        case 'washer':
          ;['washing machine','laundry'].forEach(add); break
        case 'dryer':
          ;['tumble dryer','laundry dryer'].forEach(add); break
        default: break
      }
      return Array.from(variants)
    }

    return properties.filter(p => {
      if (state.bedrooms && (p.bedrooms || 0) < state.bedrooms) return false
      if (state.bathrooms && (p.bathrooms || 0) < state.bathrooms) return false

      const selectedAmenities = (state.amenities || [])
      if (selectedAmenities.length > 0) {
        const mergedAmenities = (overrides?.[p.id]?.amenities || p.amenities || []) as string[]
        const amenitiesLower = mergedAmenities.map(a => String(a).toLowerCase())
        const matchesAll = selectedAmenities.every(sel => {
          const variants = getVariants(sel)
          return amenitiesLower.some(am => variants.some(v => am.includes(v)))
        })
        if (!matchesAll) return false
      }

      return true
    }).length
  }, [properties, overrides, state])

  // Get master amenities from berlin-real-1 (same source as admin property page)
  const amenityOptions = useMemo(() => {
    try {
      const templateId = 'berlin-real-1'
      // Find berlin-real-1 in properties
      const tpl = properties.find(p => p.id === templateId)
      const base = Array.isArray(tpl?.amenities) ? tpl!.amenities : []
      const override = Array.isArray(overrides?.[templateId]?.amenities) ? overrides![templateId]!.amenities : []
      const finalList = (override && override.length > 0) ? override : base
      
      // Add default master amenities to ensure core options always exist
      const defaultMaster = [
        'WiFi', 'Air conditioning', 'TV', 'Hair Dryer', 'Dryer', 'Heating',
        'Kitchen', 'Washer', 'Dedicated workspace', 'Iron', 'Pool', 'Hot tub',
        'Free parking', 'EV charger', 'Crib', 'King Bed', 'Gym', 'BBQ grill',
        'Breakfast', 'Fireplace', 'smoking allowed', 'smoke alarm', 'Carbon monoxide alarm'
      ]
      
      return Array.from(new Set([...defaultMaster, ...finalList]))
    } catch {
      return []
    }
  }, [properties, overrides])

  useEffect(() => {
    if (!open) setState((s) => s)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="text-xl font-semibold text-gray-900">Filters</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          {/* Rooms and beds */}
          <div>
            <div className="font-semibold mb-4 text-gray-900">Rooms and beds</div>
            
            {/* Bedrooms */}
            <div className="mb-8">
              <div className="mb-4">
                <span className="text-lg font-semibold text-gray-900">Bedrooms</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setState(s => ({ ...s, bedrooms: undefined }))}
                  className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                    !state.bedrooms 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  Any
                </button>
                {(() => {
                  const counts = Array.from(new Set(properties.map(p => p.bedrooms || 0).filter(n => n > 0))).sort((a,b) => a-b)
                  const maxCount = Math.max(...counts, 5)
                  const options = Array.from({length: maxCount}, (_, i) => i + 1)
                  
                  return options.map(num => (
                    <button
                      key={num}
                      onClick={() => setState(s => ({ ...s, bedrooms: s.bedrooms === num ? undefined : num }))}
                      className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                        state.bedrooms === num 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {num}+
                    </button>
                  ))
                })()}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="mb-8">
              <div className="mb-4">
                <span className="text-lg font-semibold text-gray-900">Bathrooms</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setState(s => ({ ...s, bathrooms: undefined }))}
                  className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                    !state.bathrooms 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  Any
                </button>
                {(() => {
                  const counts = Array.from(new Set(properties.map(p => p.bathrooms || 0).filter(n => n > 0))).sort((a,b) => a-b)
                  const maxCount = Math.max(...counts, 4)
                  const options = Array.from({length: maxCount}, (_, i) => i + 1)
                  
                  return options.map(num => (
                    <button
                      key={num}
                      onClick={() => setState(s => ({ ...s, bathrooms: s.bathrooms === num ? undefined : num }))}
                      className={`px-6 py-3 rounded-lg border text-sm font-medium transition-all ${
                        state.bathrooms === num 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {num}+
                    </button>
                  ))
                })()}
              </div>
            </div>
          </div>

          {/* Amenities - Categorized like Airbnb */}
          <div>
            <div className="font-semibold mb-4 text-gray-900">Amenities</div>
            {(() => {
              const categories: Record<string, string[]> = {
                'Popular': ['WiFi', 'Free parking', 'Air conditioning', 'TV', 'Hair Dryer', 'Dryer'],
                'Essentials': ['Kitchen', 'Washer', 'Heating', 'Dedicated workspace', 'Iron'],
                'Features': ['Pool', 'Hot tub', 'EV charger', 'Crib', 'King Bed', 'Gym', 'BBQ grill', 'Breakfast', 'Fireplace', 'smoking allowed'],
                'Safety': ['smoke alarm', 'Carbon monoxide alarm']
              }
              
              const availableSet = new Set(amenityOptions.map(a => a.toLowerCase()))
              console.log('Available amenities:', amenityOptions)
              console.log('Categories check:', Object.entries(categories).map(([title, items]) => ({
                title,
                items,
                visible: items.filter(item => availableSet.has(item.toLowerCase()))
              })))
              
              return (
                <div className="space-y-6">
                  {Object.entries(categories).map(([title, items]) => {
                    const visibleItems = items.filter(item => availableSet.has(item.toLowerCase()))
                    if (visibleItems.length === 0) return null
                    
                    return (
                      <div key={title} className="mb-6">
                        <div className="text-base font-medium text-gray-800 mb-4">{title}</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {visibleItems.map(a => {
                            const selected = state.amenities.includes(a)
                            return (
                              <button 
                                key={a} 
                                onClick={()=> setState(s=> ({ ...s, amenities: selected ? s.amenities.filter(x=>x!==a) : [...s.amenities, a] }))} 
                                className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                                  selected 
                                    ? 'bg-black text-white border-black shadow-lg' 
                                    : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-md'
                                }`}
                              >
                                {a}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white flex-shrink-0">
          <button onClick={()=>setState({ amenities: [] })} className="text-sm text-gray-700 hover:text-black font-medium underline">Clear all</button>
          <button onClick={()=> onApply(state)} className="px-8 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all">
            Show {filteredCount.toLocaleString()} {filteredCount === 1 ? 'place' : 'places'}
          </button>
        </div>
      </div>
    </div>
  )
}


