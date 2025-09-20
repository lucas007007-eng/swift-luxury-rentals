import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter required' }, { status: 400 })
    }

    const weatherApiKey = process.env.OPENWEATHER_API_KEY
    const airQualityApiKey = process.env.GOOGLE_AIR_QUALITY_API_KEY

    // City coordinates for major cities
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      'Berlin': { lat: 52.5200, lng: 13.4050 },
      'Paris': { lat: 48.8566, lng: 2.3522 },
      'Amsterdam': { lat: 52.3676, lng: 4.9041 },
      'Vienna': { lat: 48.2082, lng: 16.3738 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'London': { lat: 51.5074, lng: -0.1278 },
      'Rome': { lat: 41.9028, lng: 12.4964 },
      'Prague': { lat: 50.0755, lng: 14.4378 },
      'Copenhagen': { lat: 55.6761, lng: 12.5683 },
      'Zurich': { lat: 47.3769, lng: 8.5417 }
    }

    const coords = cityCoords[city] || cityCoords['Berlin']

    // Fetch weather data (using OpenWeatherMap as fallback if Google Weather unavailable)
    let weatherData: any = null
    if (weatherApiKey) {
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=${weatherApiKey}&units=metric`
        )
        if (weatherResponse.ok) {
          weatherData = await weatherResponse.json()
        }
      } catch (err) {
        console.error('Weather API error:', err)
      }
    }

    // Fetch air quality data
    let airQualityData: any = null
    if (airQualityApiKey) {
      try {
        const aqResponse = await fetch(
          `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${airQualityApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: {
                latitude: coords.lat,
                longitude: coords.lng
              }
            })
          }
        )
        if (aqResponse.ok) {
          airQualityData = await aqResponse.json()
        }
      } catch (err) {
        console.error('Air Quality API error:', err)
      }
    }

    // Mock data fallback for development
    const mockWeatherData = {
      temperature: Math.round(15 + Math.random() * 10),
      condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 15),
      airQuality: {
        aqi: Math.round(20 + Math.random() * 80),
        level: 'Good'
      },
      icon: '01d'
    }

    // Use real data if available, otherwise mock
    const result = weatherData ? {
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // m/s to km/h
      airQuality: airQualityData ? {
        aqi: airQualityData.indexes?.[0]?.aqi || 50,
        level: airQualityData.indexes?.[0]?.category || 'Good'
      } : mockWeatherData.airQuality,
      icon: weatherData.weather[0].icon
    } : mockWeatherData

    return NextResponse.json(result)
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}
