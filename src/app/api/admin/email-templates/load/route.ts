// Load Email Templates API
import { NextRequest, NextResponse } from 'next/server'
import { EmailTemplateConfig, DEFAULT_TEMPLATES } from '@/types/email-templates'

export async function GET(request: NextRequest) {
  try {
    // Try to load from database first
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      const dbTemplates = await (prisma as any).emailTemplate.findMany({
        orderBy: { updatedAt: 'desc' }
      })

      await prisma.$disconnect()

      if (dbTemplates.length > 0) {
        const dbMapped: EmailTemplateConfig[] = (dbTemplates as any[]).map((dbTemplate: any) => {
          // Parse the JSON template data
          const templateData = dbTemplate.templateData as any
          return {
            id: dbTemplate.templateId,
            name: dbTemplate.name,
            description: dbTemplate.description || '',
            category: dbTemplate.category as any,
            subject: dbTemplate.subject,
            preheader: dbTemplate.preheader ?? undefined,
            isActive: dbTemplate.isActive,
            lastModified: dbTemplate.updatedAt.toISOString(),
            variables: templateData.variables || [],
            styling: templateData.styling || {},
            content: templateData.content || {}
          }
        })

        // Union: start with defaults, override/append DB items by id
        const byId = new Map<string, EmailTemplateConfig>()
        for (const t of DEFAULT_TEMPLATES) byId.set(t.id, t)
        for (const t of dbMapped) byId.set(t.id, t)
        const combined = Array.from(byId.values())

        console.log(`Loaded ${dbMapped.length} templates from database; returning ${combined.length} combined with defaults`)

        return NextResponse.json({
          success: true,
          templates: combined,
          method: 'database+defaults',
          count: combined.length
        })
      }

    } catch (dbError) {
      console.error('Database load failed, will return default templates:', dbError)
    }

    // Fallback to default templates if database is empty or unavailable
    console.log('Using default templates (database unavailable or empty)')
    
    return NextResponse.json({
      success: true,
      templates: DEFAULT_TEMPLATES,
      method: 'default',
      count: DEFAULT_TEMPLATES.length,
      message: 'Loaded default templates (database unavailable)'
    })

  } catch (error) {
    console.error('Error loading templates:', error)
    
    // Return default templates as final fallback
    return NextResponse.json({
      success: true,
      templates: DEFAULT_TEMPLATES,
      method: 'fallback',
      count: DEFAULT_TEMPLATES.length,
      error: 'Error loading from database, returned defaults'
    })
  }
}
