import { NextRequest, NextResponse } from 'next/server'

// In-memory cache for weather data (2 minute TTL)
const weatherCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 2 * 60 * 1000 // 2 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter required' }, { status: 400 })
    }

    const forceBypass = searchParams.get('force') === 'true'

    // Use single normalized cache key per city
    const cacheKey = city.toLowerCase()
    const cached = weatherCache.get(cacheKey)
    if (!forceBypass && cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    const googleApiKey = process.env.GOOGLE_AIR_QUALITY_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const googleWeatherKey = process.env.GOOGLE_WEATHER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

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

    // Try Google Weather (GET first, then POST)
    let weatherData: any = null
    let basis = 'temperature'
    let provider = 'google-weather'

    if (googleWeatherKey) {
      try {
        const getResp = await fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?location=${coords.lat},${coords.lng}&units=METRIC&key=${googleWeatherKey}`,
          { cache: 'no-store' }
        )
        if (getResp.ok) {
          const gw = await getResp.json()
          const cc = gw?.currentConditions || gw
          const tempFeel = cc?.temperatureApparent ?? cc?.temperatureApparent?.value
          const tempPrim = cc?.temperature ?? cc?.temperature?.value
          const temp = (tempFeel ?? tempPrim) ?? null
          if (temp !== null) {
            const humidity = cc?.humidity ?? 60
            let wind = cc?.windSpeed ?? 3
            wind = Number(wind)
            const windMs = wind > 40 ? wind / 3.6 : wind
            basis = tempFeel != null ? 'apparent' : 'temperature'
            weatherData = {
              main: { temp: Number(temp), humidity: Number(humidity) },
              weather: [{ description: String(cc?.phrase || cc?.summary || 'clear sky'), icon: '01d' }],
              wind: { speed: windMs }
            }
          }
        }
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
            const tempFeel = cc?.temperatureApparent?.value ?? cc?.temperatureApparent
            const tempPrim = cc?.temperature?.value ?? cc?.temperature
            const temp = (tempFeel ?? tempPrim) ?? null
            if (temp !== null) {
              const humidity = cc?.humidity?.value ?? cc?.humidity ?? 60
              let wind = cc?.windSpeed?.value ?? cc?.windSpeed ?? 3
              wind = Number(wind)
              const windMs = wind > 40 ? wind / 3.6 : wind
              basis = tempFeel != null ? 'apparent' : 'temperature'
              weatherData = {
                main: { temp: Number(temp), humidity: Number(humidity) },
                weather: [{ description: String(cc?.phrase || cc?.summary || 'clear sky'), icon: '01d' }],
                wind: { speed: windMs }
              }
            }
          }
        }
      } catch {
        provider = 'stale-cache'
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
        if (aqResponse.ok) airQualityData = await aqResponse.json()
      } catch {}
    }

    if (!weatherData && cached) {
      const stale = { ...cached.data, lastUpdated: new Date().toISOString(), provider }
      weatherCache.set(cacheKey, { data: stale, timestamp: Date.now() })
      return NextResponse.json(stale)
    }

    if (!weatherData) {
      // fixed neutral fallback (first run only)
      weatherData = { main: { temp: 22, humidity: 60 }, weather: [{ description: 'partly cloudy', icon: '01d' }], wind: { speed: 3 } }
      basis = 'fallback'
      provider = 'fixed-fallback'
    }

    const result = {
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

    weatherCache.set(cacheKey, { data: result, timestamp: Date.now() })
    return NextResponse.json(result)
  } catch (error) {
    const city = new URL(request.url).searchParams.get('city')?.toLowerCase() || 'berlin'
    const cached = weatherCache.get(city)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
