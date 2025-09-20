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

    // Diagnostics holder, must be declared before any use
    let weatherDiagnostics: any = undefined

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

    // Use Google Cloud Weather API with correct endpoints
    let weatherData: any = null
    let basis = 'temperature'
    let provider = 'google-cloud-weather'

    if (googleWeatherKey) {
      try {
        // Validate Google key via Geocoding (no billing heavy weather calls)
        const geocodeResp = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${googleWeatherKey}`,
          { cache: 'no-store' }
        )
        if (!geocodeResp.ok) {
          weatherDiagnostics = { ...(weatherDiagnostics || {}), geocodeStatus: geocodeResp.status }
        }

        // Fetch weather from Open-Meteo (no key required)
        const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`
        const weatherResp = await fetch(omUrl, { cache: 'no-store' })
        if (weatherResp.ok) {
          const w = await weatherResp.json()
          const c = w.current || w.current_weather || {}

          const apparent = Number(c.apparent_temperature ?? c.temperature_2m ?? c.temperature)
          const humidity = Number(c.relative_humidity_2m ?? 60)
          const windKmh = Number(c.wind_speed_10m ?? c.windspeed ?? 0) // Open-Meteo returns km/h
          const code = Number(c.weather_code ?? c.weathercode ?? -1)

          const mapWeatherCode = (wc: number): { description: string; icon: string } => {
            switch (wc) {
              case 0: return { description: 'Clear sky', icon: '01d' }
              case 1:
              case 2: return { description: 'Partly cloudy', icon: '02d' }
              case 3: return { description: 'Overcast', icon: '04d' }
              case 45:
              case 48: return { description: 'Fog', icon: '50d' }
              case 51:
              case 53:
              case 55: return { description: 'Drizzle', icon: '09d' }
              case 56:
              case 57: return { description: 'Freezing drizzle', icon: '13d' }
              case 61:
              case 63:
              case 65: return { description: 'Rain', icon: '10d' }
              case 66:
              case 67: return { description: 'Freezing rain', icon: '13d' }
              case 71:
              case 73:
              case 75: return { description: 'Snow', icon: '13d' }
              case 77: return { description: 'Snow grains', icon: '13d' }
              case 80:
              case 81:
              case 82: return { description: 'Rain showers', icon: '09d' }
              case 85:
              case 86: return { description: 'Snow showers', icon: '13d' }
              case 95: return { description: 'Thunderstorm', icon: '11d' }
              case 96:
              case 99: return { description: 'Thunderstorm with hail', icon: '11d' }
              default: return { description: 'Unknown', icon: '01d' }
            }
          }

          const mapped = mapWeatherCode(code)

          // Keep downstream contract: wind.speed in m/s so *3.6 => km/h in result
          weatherData = {
            main: { temp: apparent, humidity },
            weather: [{ description: mapped.description, icon: mapped.icon }],
            wind: { speed: windKmh / 3.6 }
          }
          provider = 'open-meteo'
          basis = 'apparent_temperature'
          if (debug) weatherDiagnostics = { ...(weatherDiagnostics || {}), openMeteoStatus: weatherResp.status }
        } else {
          const errorText = await weatherResp.text()
          weatherDiagnostics = { ...(weatherDiagnostics || {}), openMeteoStatus: weatherResp.status, openMeteoError: errorText }
        }
      } catch (err: any) {
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
