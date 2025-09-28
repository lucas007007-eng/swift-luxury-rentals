// Save Email Template API
import { NextRequest, NextResponse } from 'next/server'
import { EmailTemplateConfig } from '@/types/email-templates'

export async function POST(request: NextRequest) {
  try {
    const template: EmailTemplateConfig = await request.json()

    if (!template.id || !template.name) {
      return NextResponse.json(
        { error: 'Missing required fields: id and name' },
        { status: 400 }
      )
    }

    // Try to save to database first
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      const savedTemplate = await (prisma as any).emailTemplate.upsert({
        where: { templateId: template.id },
        update: {
          name: template.name,
          description: template.description,
          category: template.category,
          subject: template.subject,
          // store null in DB when preheader is unset to avoid empty strings
          preheader: template.preheader ?? null,
          isActive: template.isActive,
          templateData: template as any,
          updatedAt: new Date()
        },
        create: {
          templateId: template.id,
          name: template.name,
          description: template.description || '',
          category: template.category,
          subject: template.subject,
          preheader: template.preheader ?? null,
          isActive: template.isActive,
          templateData: template as any
        }
      })

      await prisma.$disconnect()

      console.log('Template saved to database:', savedTemplate.id)
      
      return NextResponse.json({
        success: true,
        method: 'database',
        templateId: savedTemplate.id,
        message: 'Template saved to database successfully',
        template: template
      })

    } catch (dbError) {
      console.error('Database save failed, template will be saved to localStorage:', dbError)
      
      // Return success but indicate localStorage fallback
      return NextResponse.json({
        success: true,
        method: 'localStorage',
        message: 'Template saved to localStorage (database unavailable)',
        fallback: true,
        template: template
      })
    }

  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
