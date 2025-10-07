import { NextResponse } from 'next/server'

// Simple sync trigger that notifies all connected clients
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { type, data } = body
    
    if (!type) {
      return NextResponse.json({ error: 'type required' }, { status: 400 })
    }
    
    // Set global timestamps for different system updates
    const now = Date.now()
    
    switch (type) {
      case 'booking-changed':
        ;(global as any).__bookingsLastUpdate = now
        ;(global as any).__crmLastUpdate = now
        ;(global as any).__financeLastUpdate = now
        console.log(`[SYNC] Booking change triggered - all systems invalidated`)
        break
        
      case 'crm-changed':
        ;(global as any).__crmLastUpdate = now
        console.log(`[SYNC] CRM change triggered`)
        break
        
      case 'finance-changed':
        ;(global as any).__financeLastUpdate = now
        console.log(`[SYNC] Finance change triggered`)
        break
        
      default:
        // Generic update - invalidate all systems
        ;(global as any).__bookingsLastUpdate = now
        ;(global as any).__crmLastUpdate = now
        ;(global as any).__financeLastUpdate = now
        console.log(`[SYNC] Generic update - all systems invalidated`)
    }
    
    return NextResponse.json({ 
      ok: true, 
      timestamp: now,
      type,
      message: 'Sync triggered successfully' 
    })
  } catch (e: any) {
    console.error('[SYNC] Trigger failed:', e)
    return NextResponse.json({ error: 'sync failed' }, { status: 500 })
  }
}
