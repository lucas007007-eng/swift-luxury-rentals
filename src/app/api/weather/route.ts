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

    // City coordinates
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

    // Weather via Google Weather (GET first, then POST)
    let weatherData: any = null
    let provider = 'google-weather'

    if (googleWeatherKey) {
      try {
        // GET form
        const getResp = await fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?location=${coords.lat},${coords.lng}&units=METRIC&key=${googleWeatherKey}`,
          { cache: 'no-store' }
        )
        if (getResp.ok) {
          const gw = await getResp.json()
          const cc = gw?.currentConditions || gw
          const temp = cc?.temperatureApparent ?? cc?.temperature ?? null
          if (temp !== null) {
            const humidity = cc?.humidity ?? 60
            let wind = cc?.windSpeed ?? 3
            wind = Number(wind)
            const windMs = wind > 40 ? wind / 3.6 : wind
            weatherData = {
              main: { temp: Number(temp), humidity: Number(humidity) },
              weather: [{ description: String(cc?.phrase || cc?.summary || 'clear sky'), icon: '01d' }],
              wind: { speed: windMs }
            }
          }
        }
        // POST fallback if GET missing fields
        if (!weatherData) {
          const postResp = await fetch(
            `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleWeatherKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ location: { latitude: coords.lat, longitude: coords.lng }, units: 'METRIC' })
            }
          )
          if (postResp.ok) {
            const gw = await postResp.json()
            const cc = gw?.currentConditions || gw
            const temp = cc?.temperatureApparent?.value ?? cc?.temperatureApparent ?? cc?.temperature?.value ?? cc?.temperature ?? null
            if (temp !== null) {
              const humidity = cc?.humidity?.value ?? cc?.humidity ?? 60
              let wind = cc?.windSpeed?.value ?? cc?.windSpeed ?? 3
              wind = Number(wind)
              const windMs = wind > 40 ? wind / 3.6 : wind
              weatherData = {
                main: { temp: Number(temp), humidity: Number(humidity) },
                weather: [{ description: String(cc?.phrase || cc?.summary || 'clear sky'), icon: '01d' }],
                wind: { speed: windMs }
              }
            }
          }
        }
      } catch (e) {
        provider = 'fallback-seasonal'
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
      } catch {}
    }

    // Seasonal fallback only if Google Weather key missing or both calls failed
    if (!weatherData) {
      provider = provider === 'google-weather' ? 'fallback-seasonal' : provider
      const temp = getSeasonalTemp(city)
      weatherData = {
        main: { temp, humidity: 60 },
        weather: [{ description: 'partly cloudy', icon: '01d' }],
        wind: { speed: 3 }
      }
    }

    const result = {
      temperature: Math.round(Number(weatherData.main.temp)),
      condition: weatherData.weather[0].description,
      humidity: Number(weatherData.main.humidity ?? 60),
      windSpeed: Math.round(Number(weatherData.wind.speed) * 3.6),
      airQuality: airQualityData ? {
        aqi: airQualityData.indexes?.[0]?.aqi || 50,
        level: airQualityData.indexes?.[0]?.category || 'Good'
      } : { aqi: 50, level: 'Good' },
      icon: weatherData.weather[0].icon,
      lastUpdated: new Date().toISOString(),
      provider,
      coordinates: { lat: coords.lat, lng: coords.lng }
    }

    // Cache
    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
