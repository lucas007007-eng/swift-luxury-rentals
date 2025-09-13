import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get('url')
  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  try {
    const upstream = await fetch(targetUrl, {
      // Avoid sending a Referer; some providers block hotlinking
      // Provide a common UA and accept header to improve compatibility
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      },
      cache: 'no-store'
    })

    if (!upstream.ok) {
      return new NextResponse(`Upstream failed: ${upstream.status}`, { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await upstream.arrayBuffer()

    return new NextResponse(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': contentType,
        // Cache for a day on client/CDN while letting dev refresh easily
        'Cache-Control': 'public, max-age=86400, s-maxage=86400'
      }
    })
  } catch (err) {
    return new NextResponse('Proxy error', { status: 500 })
  }
}


