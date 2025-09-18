'use client'

import React, { useEffect, useMemo, useState } from 'react'

type CityPin = {
  city: string
  lat: number
  lon: number
}

const CITY_PINS: CityPin[] = [
  { city: 'London', lat: 51.5074, lon: -0.1278 },
  { city: 'Paris', lat: 48.8566, lon: 2.3522 },
  { city: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { city: 'Berlin', lat: 52.52, lon: 13.405 },
  { city: 'Vienna', lat: 48.2082, lon: 16.3738 },
  { city: 'Barcelona', lat: 41.3874, lon: 2.1686 },
  { city: 'Rome', lat: 41.9028, lon: 12.4964 },
  { city: 'Prague', lat: 50.0755, lon: 14.4378 },
  { city: 'Copenhagen', lat: 55.6761, lon: 12.5683 },
  { city: 'Zurich', lat: 47.3769, lon: 8.5417 },
]

// Simple Web Mercator projection utilities (no external deps)
function projectMercator(lon: number, lat: number, width: number, height: number, bounds: { west: number; east: number; north: number; south: number }) {
  const lambda = (lon - bounds.west) / (bounds.east - bounds.west)
  const phi = clamp((mercatorY(lat) - mercatorY(bounds.north)) / (mercatorY(bounds.south) - mercatorY(bounds.north)), 0, 1)
  const x = lambda * width
  const y = phi * height
  return [x, y] as const
}

function mercatorY(lat: number) {
  const rad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + rad / 2))
}

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }

// Europe bounds (approx) for projection framing
const EUROPE_BOUNDS = { west: -11.0, east: 31.5, north: 60.0, south: 36.0 }

type GeoJSON = any

export default function SpyEuropeMap({ onPinClick }: { onPinClick?: (city: string) => void }) {
  const [geo, setGeo] = useState<GeoJSON | null>(null)
  const [hoverCity, setHoverCity] = useState<string | null>(null)
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Lightweight Europe GeoJSON (countries). Public raw URL with permissive CORS.
        const src = 'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson'
        const res = await fetch(src, { cache: 'force-cache' })
        if (!res.ok) throw new Error('geo fetch failed')
        const g = await res.json()
        if (!cancelled) setGeo(g)
      } catch {
        if (!cancelled) setGeo(null)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const width = 320
  const height = 200

  const projectedPins = useMemo(() => {
    return CITY_PINS.map((p) => {
      const [x, y] = projectMercator(p.lon, p.lat, width, height, EUROPE_BOUNDS)
      return { ...p, x, y }
    })
  }, [])

  const hoverPin = useMemo(() => projectedPins.find(p => p.city === hoverCity) || null, [projectedPins, hoverCity])
  const centerX = hoverPin ? hoverPin.x : width * 0.5
  const centerY = hoverPin ? hoverPin.y : height * 0.58
  const baseZoom = 1.22
  const maxZoom = 3.2
  const proximityZoom = useMemo(() => {
    if (!mouse) return baseZoom
    // compute distance (in SVG units) to nearest pin
    let nearest = Infinity
    for (const p of projectedPins) {
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const d = Math.hypot(dx, dy)
      if (d < nearest) nearest = d
    }
    // tighter threshold in SVG units (pixels of the 320x200 viewBox)
    const threshold = 18
    const clamped = Math.max(0, Math.min(1, (threshold - nearest) / threshold))
    // ease-out cubic for smoother ramp
    const eased = 1 - Math.pow(1 - clamped, 3)
    return baseZoom + (maxZoom - baseZoom) * eased
  }, [mouse, projectedPins])
  const zoom = hoverPin ? maxZoom : proximityZoom
  const baseOffsetX = 18 // nudge map right to reduce right-side gap
  const offsetX = hoverPin ? 0 : baseOffsetX

  const countryPaths = useMemo(() => {
    if (!geo) return [] as string[]
    const features = (geo.features || []).filter((f: any) => !!f?.geometry)
    const paths: string[] = []
    for (const f of features) {
      const geom = f.geometry
      if (!geom) continue
      if (geom.type === 'Polygon') {
        paths.push(toPath(geom.coordinates as number[][][]))
      } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates as number[][][][]) {
          paths.push(toPath(poly as unknown as number[][][]))
        }
      }
    }
    return paths
  }, [geo])

  function toPath(rings: number[][][]) {
    let d = ''
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const [lon, lat] = ring[i]
        const [x, y] = projectMercator(lon, lat, width, height, EUROPE_BOUNDS)
        d += (i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`)
      }
      d += ' Z '
    }
    return d
  }

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        onMouseMove={(e) => {
          const svg = e.currentTarget
          const rect = svg.getBoundingClientRect()
          const x = ((e.clientX - rect.left) / rect.width) * width
          const y = ((e.clientY - rect.top) / rect.height) * height
          setMouse({ x, y })
          // proximity hover: snap to nearest pin within threshold
          let best: { city: string; d: number } | null = null
          for (const p of projectedPins) {
            const dx = p.x - x
            const dy = p.y - y
            const d = Math.hypot(dx, dy)
            if (!best || d < best.d) best = { city: p.city, d }
          }
          const threshold = 18
          if (best && best.d <= threshold) setHoverCity(best.city)
          else setHoverCity(null)
        }}
        onMouseLeave={() => { setMouse(null); setHoverCity(null) }}
      >
        {/* Spy grid background */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(16,185,129,0.08)" strokeWidth="1" />
          </pattern>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </radialGradient>
          <clipPath id="clipAll"><rect x="0" y="0" width={width} height={height} /></clipPath>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#grid)" />


        {/* Zooming scene (countries + pins) */}
        <g style={{ transform: `translateX(${offsetX}px) scale(${zoom})`, transformOrigin: `${centerX}px ${centerY}px`, transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
          {/* Countries */}
          <g clipPath="url(#clipAll)" opacity={0.9}>
            {countryPaths.map((d, i) => (
              <path key={i} d={d} fill="#0b2019" stroke="#1ea97a" strokeOpacity={0.25} strokeWidth={0.6} />
            ))}
          </g>

          {/* Pins with labels */}
          {projectedPins.map(({ city, x, y }) => (
            <g key={city} transform={`translate(${x}, ${y})`} style={{ opacity: hoverCity && hoverCity !== city ? 0 : 1, transition: 'opacity 200ms ease' }}>
              <circle r={3} fill="#fbbf24" style={{ animation: hoverCity === city ? 'none' : 'pin-pulse 2s ease-in-out infinite' as any }} />
              <text y={-6} x={6} fill="#fbbf24" fontSize={8} style={{ pointerEvents: 'none' }}>{city}</text>
              <rect x={-10} y={-10} width={20} height={20} fill="transparent" onMouseEnter={()=>setHoverCity(city)} onMouseLeave={()=>setHoverCity(null)} onClick={()=>onPinClick?.(city)} />
            </g>
          ))}

          {/* City detail when hovered: subtle circular ring only */}
          {hoverPin && (
            <g opacity={0.9}>
              <circle cx={centerX} cy={centerY} r={12} fill="none" stroke="#1ea97a" strokeOpacity={0.6} strokeDasharray="2 3" />
            </g>
          )}
        </g>

        {/* Soft green pulse (no rotating sweep) */}
        <g pointerEvents="none">
          <circle cx={centerX} cy={centerY} r={60/zoom} fill="url(#radarGlow)" opacity={0.8} />
        </g>
      </svg>
    </div>
  )
}


