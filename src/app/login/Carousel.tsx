"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { cityProperties } from '@/data/cityProperties'
import { getProxiedImageUrl } from '@/lib/utils'

function collectImages(): string[] {
  const berlin = cityProperties.Berlin || []
  const urls: string[] = []
  for (const p of berlin) {
    if (p.sourcePlatform === 'Wunderflats') continue
    for (const src of (p.images || [])) {
      urls.push(src)
      if (urls.length >= 12) break
    }
    if (urls.length >= 12) break
  }
  return urls
}

export default function Carousel() {
  const [idx, setIdx] = useState(0)
  const images = useMemo(()=> collectImages(), [])
  useEffect(()=>{
    const t = setInterval(()=> setIdx(i => (i+1)%Math.max(1, images.length)), 3500)
    return ()=> clearInterval(t)
  },[images.length])
  return (
    <div className="w-full h-full">
      {images.map((src, i)=> (
        <div key={src} className={`absolute inset-0 bg-center bg-cover transition-opacity duration-700 ${i===idx? 'opacity-100':'opacity-0'}`} style={{ backgroundImage: `url(${getProxiedImageUrl(src)})` }} />
      ))}
    </div>
  )
}
