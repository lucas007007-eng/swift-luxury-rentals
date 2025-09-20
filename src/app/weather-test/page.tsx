'use client'

import React, { useState, useEffect } from 'react'

export default function WeatherTestPage() {
  const [activeWeather, setActiveWeather] = useState<string>('rain')

  const weatherTypes = [
    { key: 'clear', label: 'Clear' },
    { key: 'sunny', label: 'Sunny' },
    { key: 'cloudy', label: 'Cloudy' },
    { key: 'rain', label: 'Rain' },
    { key: 'snow', label: 'Snow' },
    { key: 'thunder', label: 'Thunder' }
  ]

  // Generate raindrops for rain animation
  useEffect(() => {
    if (activeWeather !== 'rain') {
      // Clear rain container when not rain
      const rainContainer = document.getElementById('rain-container')
      if (rainContainer) rainContainer.innerHTML = ''
      return
    }

    const rainContainer = document.getElementById('rain-container')
    if (!rainContainer) return

    // Force clear existing raindrops and any cached elements
    rainContainer.innerHTML = ''
    rainContainer.style.display = 'block'

    // Create 80 raindrops with size variation
    for (let i = 0; i < 80; i++) {
      const raindrop = document.createElement('div')
      raindrop.className = 'raindrop'
      
      // Random horizontal position
      const leftPos = Math.random() * 100
      raindrop.style.left = `${leftPos}vw`
      
      // Random size variation - water drop emoji style
      const scale = Math.random() * 0.8 + 0.7 // Between 0.7x and 1.5x scale
      raindrop.style.transform = `scale(${scale})`
      
      // Random opacity for depth
      const opacity = Math.random() * 0.4 + 0.6 // Between 0.6 and 1.0
      raindrop.style.opacity = `${opacity}`
      
      // Match CodePen fall speed and timing
      const duration = Math.random() * 1 + 1.5 // Between 1.5s and 2.5s (faster)
      const delay = Math.random() * 2 // Between 0s and 2s
      raindrop.style.animationDuration = `${duration}s`
      raindrop.style.animationDelay = `-${delay}s`
      
      // Create splash effect when raindrop hits bottom
      setTimeout(() => {
        createSplash(leftPos + (30 * (duration / 2))) // Account for diagonal movement
      }, duration * 1000)
      
      rainContainer.appendChild(raindrop)
    }

    // Function to create splash effect
    function createSplash(leftPosition: number) {
      const container = document.getElementById('rain-container')
      if (!container) return
      
      const splash = document.createElement('div')
      splash.className = 'splash'
      splash.style.left = `${leftPosition}vw`
      splash.style.transform = 'translateX(-50%)'
      
      container.appendChild(splash)
      
      // Remove splash after animation completes
      setTimeout(() => {
        if (splash.parentNode) {
          splash.parentNode.removeChild(splash)
        }
      }, 300)
    }
  }, [activeWeather])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Controls */}
      <div className="fixed top-4 left-4 z-50 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Weather Animation Test</h3>
        <div className="space-y-2">
          {weatherTypes.map(weather => (
            <button
              key={weather.key}
              onClick={() => setActiveWeather(weather.key)}
              className={`block w-full px-3 py-2 rounded text-left ${
                activeWeather === weather.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {weather.label}
            </button>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-300">
          Active: weather-bg-{activeWeather}
        </div>
      </div>

      {/* Weather Animation Demo Area */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Rain Container for JavaScript-generated raindrops */}
        {activeWeather === 'rain' && (
          <div id="rain-container" className="fixed inset-0 pointer-events-none z-50" />
        )}
        
        {/* Other weather backgrounds */}
        {activeWeather !== 'rain' && (
          <div className={`absolute inset-0 weather-bg-${activeWeather}`} />
        )}
        
        {/* Content to show overlay effect */}
        <div className="relative flex items-center justify-center h-full" style={{zIndex: 5}}>
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">Weather Animation Demo</h1>
            <p className="text-2xl text-gray-300">Current: {activeWeather.toUpperCase()}</p>
            <p className="text-lg text-gray-400 mt-4">
              This should show the weather animation overlay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
