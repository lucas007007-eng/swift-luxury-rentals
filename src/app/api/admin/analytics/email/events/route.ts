import { NextRequest, NextResponse } from 'next/server'

// SSE endpoint for real-time analytics updates
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))
      
      // Set up interval to keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'))
      }, 30000)
      
      // Store the controller globally so webhook can trigger updates
      ;(global as any).__analyticsController = controller
      ;(global as any).__analyticsKeepalive = keepAlive
      
      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        if ((global as any).__analyticsController === controller) {
          delete (global as any).__analyticsController
          delete (global as any).__analyticsKeepalive
        }
        controller.close()
      })
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
