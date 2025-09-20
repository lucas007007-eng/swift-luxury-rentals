'use client'

import React, { useState, useEffect } from 'react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  airQuality: {
    aqi: number
    level: string
  }
  icon: string
  lastUpdated?: string
}

interface WeatherWidgetProps {
  city: string
  className?: string
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city, className = '' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`, {
          cache: 'no-store' // Always fetch fresh data
        })
        if (response.ok) {
          const data = await response.json()
          if (data.error) {
            throw new Error(data.error)
          }
          setWeather(data)
        } else {
          throw new Error('Weather data unavailable')
        }
      } catch (err) {
        setError('Weather unavailable')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (city) {
      fetchWeather()
      
      // Auto-refresh every 5 minutes for real-time data
      const interval = setInterval(fetchWeather, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [city])

  const getWeatherAnimation = (condition: string) => {
    const cond = condition.toLowerCase()
    if (cond.includes('rain') || cond.includes('drizzle')) {
      return 'rain'
    } else if (cond.includes('snow')) {
      return 'snow'
    } else if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
      return 'thunder'
    } else if (cond.includes('cloud')) {
      return 'cloudy'
    } else if (cond.includes('clear') || cond.includes('sunny')) {
      return 'sunny'
    }
    return 'clear'
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'text-green-400'
    if (aqi <= 100) return 'text-yellow-400'
    if (aqi <= 150) return 'text-orange-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className={`bond-card backdrop-blur-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600/60 rounded mb-2"></div>
          <div className="h-6 bg-gray-600/60 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return null // Hide widget completely when API fails
  }

  const animationType = getWeatherAnimation(weather.condition)

  return (
    <div className={`relative bond-card backdrop-blur-md p-4 overflow-hidden ${className}`}>
      {/* Weather Animation Background */}
      <div className="absolute inset-0 pointer-events-none">
        {animationType === 'rain' && (
          <div className="rain-animation">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-blue-300/30 rounded-full rainDrop"
                style={{
                  left: `${(i * 5) % 100}%`,
                  animationDelay: `${(i * 0.1) % 2}s`,
                  animationDuration: `${1 + (i % 3) * 0.5}s`
                }}
              />
            ))}
          </div>
        )}
        {animationType === 'snow' && (
          <div className="snow-animation">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full snowFlake"
                style={{
                  left: `${(i * 7) % 100}%`,
                  animationDelay: `${(i * 0.2) % 3}s`,
                  animationDuration: `${3 + (i % 2)}s`
                }}
              />
            ))}
          </div>
        )}
        {animationType === 'sunny' && (
          <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400/20 rounded-full animate-pulse" />
        )}
        {animationType === 'cloudy' && (
          <div className="absolute top-1 right-1 w-6 h-4 bg-gray-300/20 rounded-full" />
        )}
        {animationType === 'thunder' && (
          <>
            <div className="absolute inset-0 bg-black/20 animate-pulse"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-10 w-0.5 bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)] lightningBolt"
                style={{
                  left: `${15 + i * 30}%`,
                  top: `${10 + i * 20}%`,
                  animationDelay: `${i * 1.2}s`
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Weather Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className="text-white font-semibold text-2xl md:text-3xl bond-temp">
            {Math.round(weather.temperature)}°C
          </div>
          <div className="text-[11px] md:text-xs text-gray-300/90 uppercase tracking-wide">
            {weather.condition}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300/90">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            <span>{weather.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Air Quality */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300/90">Air Quality</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getAQIColor(weather.airQuality.aqi).replace('text-', 'bg-')}`} />
              <span className={getAQIColor(weather.airQuality.aqi)}>
                {weather.airQuality.aqi} AQI
              </span>
            </div>
          </div>
          {weather.lastUpdated && (
            <div className="text-[10px] text-gray-500 mt-1">
              Updated: {new Date(weather.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes rainDrop {
          0% { transform: translateY(-100px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(200px) translateX(10px); opacity: 0; }
        }
        @keyframes snowFall {
          0% { transform: translateY(-100px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(200px) translateX(30px); opacity: 0; }
        }
        .rain-animation .rainDrop {
          animation: rainDrop 1s linear infinite;
        }
        .snow-animation .snowFlake {
          animation: snowFall 3s linear infinite;
        }
        @keyframes lightning {
          0%, 100% { opacity: 0; transform: scaleY(0.6) rotate(10deg); }
          5% { opacity: 1; transform: scaleY(1) rotate(10deg); }
          10%, 90% { opacity: 0; }
        }
        .lightningBolt { animation: lightning 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default WeatherWidget
