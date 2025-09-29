import { NextRequest, NextResponse } from 'next/server'

// Test endpoint to verify webhook setup
export async function POST(req: NextRequest) {
  console.log('🧪 Test webhook received')
  console.log('Headers:', Object.fromEntries(req.headers.entries()))
  
  const body = await req.text()
  console.log('Body:', body)
  
  return NextResponse.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    hasSecret: !!process.env.RESEND_WEBHOOK_SECRET,
    receivedHeaders: Object.fromEntries(req.headers.entries())
  })
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook test endpoint ready',
    hasSecret: !!process.env.RESEND_WEBHOOK_SECRET,
    secretPreview: process.env.RESEND_WEBHOOK_SECRET ? 
      process.env.RESEND_WEBHOOK_SECRET.substring(0, 10) + '...' : 
      'not set'
  })
}
