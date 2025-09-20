'use client'

import React, { useState } from 'react'

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
        <div className={`absolute inset-0 weather-bg-${activeWeather}`} style={{zIndex: 1}} />
        
        {/* Test overlay to ensure layering works */}
        <div className="absolute inset-0 bg-red-500 opacity-20" style={{zIndex: 0}} />
        
        {/* Content to show overlay effect */}
        <div className="relative flex items-center justify-center h-full" style={{zIndex: 10}}>
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
