import { NextRequest, NextResponse } from 'next/server'

// Engagement tracking endpoint for click-based opens
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const emailId = searchParams.get('id')
    const action = searchParams.get('action') || 'view'
    const redirect = searchParams.get('redirect')
    
    if (emailId) {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      console.log(`📊 Engagement tracking: ${action} for email ${emailId}`)
      
      if (action === 'view' || action === 'open') {
        // Try multiple ways to find and update the email record
        const result = await (prisma as any).emailSent.updateMany({
          where: { providerId: emailId },
          data: { 
            openedAt: new Date(),
            status: 'opened'
          }
        })
        
        // If no match on providerId, try by temporary ID pattern
        if (result.count === 0 && emailId.startsWith('temp-')) {
          const tempId = emailId
          const result2 = await (prisma as any).emailSent.updateMany({
            where: { providerId: tempId },
            data: { 
              openedAt: new Date(),
              status: 'opened'
            }
          })
          console.log(`✅ Email marked as opened via temp ID (${result2.count} records updated)`)
        } else {
          console.log(`✅ Email marked as opened via engagement tracking (${result.count} records updated)`)
        }
      }
      
      if (action === 'click') {
        // Mark as clicked
        await (prisma as any).emailSent.updateMany({
          where: { providerId: emailId },
          data: { 
            clickedAt: new Date(),
            status: 'clicked'
          }
        })
        console.log('✅ Email marked as clicked via engagement tracking')
      }
      
      await prisma.$disconnect()
    }
    
    // Redirect if specified, otherwise return tracking pixel
    if (redirect) {
      return NextResponse.redirect(decodeURIComponent(redirect))
    }
    
    // Return 1x1 transparent tracking pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )
    
    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (e) {
    console.error('Engagement tracking error:', e)
    return new Response('', { status: 200 })
  }
}
