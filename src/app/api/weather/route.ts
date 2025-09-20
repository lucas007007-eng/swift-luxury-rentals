import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for weather data (5 minute TTL)
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter required' }, { status: 400 })
    }

    // Optional cache bypass for testing: /api/weather?city=Berlin&force=true
    const forceBypass = searchParams.get('force') === 'true'

    // Check cache first
    const cacheKey = city.toLowerCase()
    const cached = weatherCache.get(cacheKey)
    if (!forceBypass && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const googleApiKey = process.env.GOOGLE_AIR_QUALITY_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const googleWeatherKey = process.env.GOOGLE_WEATHER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const openWeatherApiKey = process.env.OPENWEATHER_API_KEY

    // City coordinates for major cities
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'amsterdam': { lat: 52.3676, lng: 4.9041 },
      'vienna': { lat: 48.2082, lng: 16.3738 },
      'barcelona': { lat: 41.3851, lng: 2.1734 },
      'london': { lat: 51.5074, lng: -0.1278 },
      'rome': { lat: 41.9028, lng: 12.4964 },
      'prague': { lat: 50.0755, lng: 14.4378 },
      'copenhagen': { lat: 55.6761, lng: 12.5683 },
      'zurich': { lat: 47.3769, lng: 8.5417 }
    }

    const coords = cityCoords[city.toLowerCase()] || cityCoords['berlin']

    // Helper functions for consistent weather data
    const getSeasonalTemp = (cityName: string): number => {
      const month = new Date().getMonth() // 0-11
      const day = new Date().getDate()
      const baseTemps: Record<string, number[]> = {
        'berlin': [2, 4, 8, 13, 18, 21, 23, 23, 19, 13, 7, 3]
      }
      const temps = baseTemps[cityName.toLowerCase()] || baseTemps['berlin']
      const dailyVariation = Math.sin(day / 31 * Math.PI * 2) * 3
      return temps[month] + dailyVariation
    }

    const getSeasonalWeather = (): string => {
      const month = new Date().getMonth()
      const day = new Date().getDate()
      const seed = (day + month * 31) % 6
      const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'light rain', 'overcast clouds']
      if (month >= 10 || month <= 2) return conditions[seed < 2 ? seed : 2 + (seed % 4)]
      return conditions[seed < 3 ? seed : (seed % 3)]
    }

    // Weather via Google Weather API, else OpenWeather, else seasonal
    let weatherData: any = null

    if (googleWeatherKey) {
      try {
        const googleWeatherResp = await fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleWeatherKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: { latitude: coords.lat, longitude: coords.lng },
              units: 'METRIC'
            })
          }
        )
        if (googleWeatherResp.ok) {
          const gw = await googleWeatherResp.json()
          const cc = gw?.currentConditions || gw
          const temp = cc?.temperatureApparent?.value ?? cc?.temperatureApparent ?? cc?.temperature?.value ?? cc?.temperature ?? null
          const humidity = cc?.humidity?.value ?? cc?.humidity ?? null
          // Google Weather wind can be kph or m/s depending on source; if >40 treat as kph and convert
          let wind = cc?.windSpeed?.value ?? cc?.windSpeed ?? 3
          wind = Number(wind)
          const windMs = wind > 40 ? wind / 3.6 : wind
          const desc = cc?.phrase || cc?.summary || cc?.condition || 'clear sky'

          if (temp !== null) {
            weatherData = {
              main: { temp, humidity: humidity ?? 60 },
              weather: [{ description: String(desc), icon: '01d' }],
              wind: { speed: windMs }
            }
          }
        }
      } catch (e) {
        console.error('Google Weather API error:', e)
      }
    }

    if (!weatherData && openWeatherApiKey) {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${openWeatherApiKey}&units=metric`
        )
        if (weatherResponse.ok) weatherData = await weatherResponse.json()
      } catch (err) {
        console.error('OpenWeather API error:', err)
      }
    }

    // Fetch air quality data from Google
    let airQualityData: any = null
    if (googleApiKey) {
      try {
        const aqResponse = await fetch(
          `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: { latitude: coords.lat, longitude: coords.lng },
              extraComputations: ['HEALTH_RECOMMENDATIONS','DOMINANT_POLLUTANT','POLLUTANT_ADDITIONAL_INFO']
            })
          }
        )
        if (aqResponse.ok) airQualityData = await aqResponse.json()
      } catch (err) {
        console.error('Air Quality API error:', err)
      }
    }

    if (!weatherData && !googleWeatherKey && !openWeatherApiKey) {
      weatherData = {
        main: { temp: getSeasonalTemp(city), humidity: 60 },
        weather: [{ description: getSeasonalWeather(), icon: '01d' }],
        wind: { speed: 3 }
      }
    }

    const mockWeatherData = {
      temperature: Math.round(15 + Math.random() * 10),
      condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 15),
      airQuality: { aqi: Math.round(20 + Math.random() * 80), level: 'Good' },
      icon: '01d'
    }

    const result = weatherData ? {
      temperature: Math.round(Number(weatherData.main.temp)),
      condition: weatherData.weather[0].description,
      humidity: Number(weatherData.main.humidity ?? 60),
      windSpeed: Math.round(Number(weatherData.wind.speed) * 3.6),
      airQuality: airQualityData ? {
        aqi: airQualityData.indexes?.[0]?.aqi || 50,
        level: airQualityData.indexes?.[0]?.category || 'Good'
      } : mockWeatherData.airQuality,
      icon: weatherData.weather[0].icon,
      lastUpdated: new Date().toISOString()
    } : { ...mockWeatherData, lastUpdated: new Date().toISOString() }

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
