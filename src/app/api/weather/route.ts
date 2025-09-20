import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for weather data (30 second TTL for testing)
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter required' }, { status: 400 })
    }

    const forceBypass = searchParams.get('force') === 'true'
    const debug = searchParams.get('debug') === 'true'

    // Use single normalized cache key per city
    const cacheKey = city.toLowerCase()
    const cached = weatherCache.get(cacheKey)
    if (!forceBypass && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Use a single unified key preference order (server-side safe)
    const googleWeatherKey =
      process.env.GOOGLE_WEATHER_API_KEY ||
      process.env.GOOGLE_AIR_QUALITY_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const googleApiKey =
      process.env.GOOGLE_AIR_QUALITY_API_KEY ||
      process.env.GOOGLE_WEATHER_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // Debug API key availability
    if (debug) {
      weatherDiagnostics = {
        hasWeatherKey: !!googleWeatherKey,
        hasAirQualityKey: !!googleApiKey,
        weatherKeySource: googleWeatherKey ? 'available' : 'missing',
        airQualityKeySource: googleApiKey ? 'available' : 'missing'
      }
    }

    const cityCoords: Record<string, { lat: number; lng: number }> = {
      berlin: { lat: 52.52, lng: 13.405 },
      paris: { lat: 48.8566, lng: 2.3522 },
      amsterdam: { lat: 52.3676, lng: 4.9041 },
      vienna: { lat: 48.2082, lng: 16.3738 },
      barcelona: { lat: 41.3851, lng: 2.1734 },
      london: { lat: 51.5074, lng: -0.1278 },
      rome: { lat: 41.9028, lng: 12.4964 },
      prague: { lat: 50.0755, lng: 14.4378 },
      copenhagen: { lat: 55.6761, lng: 12.5683 },
      zurich: { lat: 47.3769, lng: 8.5417 }
    }

    const coords = cityCoords[cacheKey] || cityCoords.berlin

    // Use OpenWeatherMap API (reliable weather service)
    let weatherData: any = null
    let basis = 'temperature'
    let provider = 'openweathermap'
    let weatherDiagnostics: any = undefined

    if (googleWeatherKey) {
      try {
        const owmResp = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${googleWeatherKey}&units=metric`,
          { cache: 'no-store' }
        )
        if (owmResp.ok) {
          const owmData = await owmResp.json()
          weatherData = {
            main: { temp: owmData.main.feels_like || owmData.main.temp, humidity: owmData.main.humidity },
            weather: [{ description: owmData.weather[0].description, icon: owmData.weather[0].icon }],
            wind: { speed: owmData.wind.speed }
          }
          provider = 'openweathermap'
          basis = owmData.main.feels_like ? 'feels_like' : 'temperature'
        } else {
          const errorText = await owmResp.text()
          weatherDiagnostics = { ...(weatherDiagnostics || {}), openWeatherStatus: owmResp.status, openWeatherError: errorText }
        }
      } catch (err: any) {
        provider = 'api-error'
        weatherDiagnostics = { ...(weatherDiagnostics || {}), error: String(err?.message || err) }
      }
    }

    // Air Quality (best-effort)
    let airQualityData: any = null
    if (googleApiKey) {
      try {
        const aqResponse = await fetch(
          `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location: { latitude: coords.lat, longitude: coords.lng } })
          }
        )
        if (aqResponse.ok) {
          airQualityData = await aqResponse.json()
        } else {
          if (debug) weatherDiagnostics = { ...(weatherDiagnostics || {}), airQualityStatus: aqResponse.status }
        }
      } catch (err: any) {
        if (debug) weatherDiagnostics = { ...(weatherDiagnostics || {}), airQualityError: String(err?.message || err) }
      }
    }

    if (!weatherData && cached) {
      const stale = { ...cached.data, lastUpdated: new Date().toISOString(), provider }
      weatherCache.set(cacheKey, { data: stale, timestamp: Date.now() })
      return NextResponse.json(stale)
    }

    if (!weatherData) {
      // Return error instead of fallback when Google API fails
      return NextResponse.json({ 
        error: 'Weather data unavailable', 
        debug: weatherDiagnostics,
        provider: 'api-failed',
        coordinates: { lat: coords.lat, lng: coords.lng }
      }, { status: 503 })
    }

    const result: any = {
      temperature: Math.round(Number(weatherData.main.temp)),
      condition: weatherData.weather[0].description,
      humidity: Number(weatherData.main.humidity ?? 60),
      windSpeed: Math.round(Number(weatherData.wind.speed) * 3.6),
      airQuality: airQualityData
        ? { aqi: airQualityData.indexes?.[0]?.aqi || 50, level: airQualityData.indexes?.[0]?.category || 'Good' }
        : (cached ? cached.data.airQuality : { aqi: 50, level: 'Good' }),
      icon: weatherData.weather[0].icon,
      lastUpdated: new Date().toISOString(),
      provider,
      basis,
      coordinates: { lat: coords.lat, lng: coords.lng }
    }
    if (debug && weatherDiagnostics) result.debug = weatherDiagnostics

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return NextResponse.json(result)
  } catch (error) {
    const city = new URL(request.url).searchParams.get('city')?.toLowerCase() || 'berlin'
    const cached = weatherCache.get(city)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
