// Simple sync trigger utility
export async function triggerSync(type: 'booking-changed' | 'crm-changed' | 'finance-changed' | 'sales-changed' | 'all', data?: any) {
  try {
    // Set global cache invalidation timestamps
    const now = Date.now()
    
    switch (type) {
      case 'booking-changed':
        ;(global as any).__bookingsLastUpdate = now
        ;(global as any).__crmLastUpdate = now
        ;(global as any).__financeLastUpdate = now
        ;(global as any).__salesLastUpdate = now
        break
        
      case 'crm-changed':
        ;(global as any).__crmLastUpdate = now
        break
        
      case 'finance-changed':
        ;(global as any).__financeLastUpdate = now
        break
        
      case 'sales-changed':
        ;(global as any).__salesLastUpdate = now
        break
        
      case 'all':
        ;(global as any).__bookingsLastUpdate = now
        ;(global as any).__crmLastUpdate = now
        ;(global as any).__financeLastUpdate = now
        ;(global as any).__salesLastUpdate = now
        break
    }
    
    console.log(`[SYNC] ${type} triggered at ${now}`)
    return true
  } catch (e) {
    console.error('[SYNC] Failed to trigger sync:', e)
    return false
  }
}

// Auto-sync booking operations with aggressive cache busting
export async function syncBookingOperation(operation: 'created' | 'confirmed' | 'deleted', bookingData?: any) {
  try {
    // Always trigger all systems for booking operations with aggressive timestamps
    const now = Date.now()
    ;(global as any).__bookingsLastUpdate = now
    ;(global as any).__crmLastUpdate = now
    ;(global as any).__financeLastUpdate = now
    ;(global as any).__salesLastUpdate = now
    
    // Also trigger the generic sync
    await triggerSync('booking-changed', { operation, booking: bookingData })
    
    // Log the operation with more detail
    console.log(`[BOOKING-SYNC] ✅ ${operation.toUpperCase()} operation synced across all systems at ${now}`)
    console.log(`[BOOKING-SYNC] - Bookings: ${now}`)
    console.log(`[BOOKING-SYNC] - CRM: ${now}`)
    console.log(`[BOOKING-SYNC] - Finance: ${now}`)
    console.log(`[BOOKING-SYNC] - Sales Analytics: ${now}`)
    
    if (bookingData) {
      console.log(`[BOOKING-SYNC] - Data:`, bookingData)
    }
    
    return true
  } catch (e) {
    console.error(`[BOOKING-SYNC] Failed to sync ${operation} operation:`, e)
    return false
  }
}
