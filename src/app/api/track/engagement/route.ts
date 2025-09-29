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
        // For temp IDs, find the most recent email without openedAt set
        if (emailId.startsWith('temp-')) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
          const result = await (prisma as any).emailSent.updateMany({
            where: { 
              sentAt: { gte: fiveMinutesAgo },
              openedAt: null,
              category: 'test'
            },
            data: { 
              openedAt: new Date(),
              status: 'opened'
            }
          })
          console.log(`✅ Email marked as opened via recent lookup (${result.count} records updated)`)
        } else {
          // Try exact providerId match
          const result = await (prisma as any).emailSent.updateMany({
            where: { providerId: emailId },
            data: { 
              openedAt: new Date(),
              status: 'opened'
            }
          })
          console.log(`✅ Email marked as opened via providerId (${result.count} records updated)`)
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
