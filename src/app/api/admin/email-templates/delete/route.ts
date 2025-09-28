import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const templateId = url.searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      await (prisma as any).emailTemplate.delete({
        where: { templateId }
      })

      await prisma.$disconnect()
      return NextResponse.json({ success: true, method: 'database' })
    } catch (dbErr) {
      console.error('Delete via database failed:', dbErr)
      return NextResponse.json({ success: false, method: 'database', fallback: true })
    }
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}


