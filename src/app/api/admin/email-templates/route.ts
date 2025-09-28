// Admin Email Templates API
import { NextRequest, NextResponse } from 'next/server'
import { EmailTemplateConfig, DEFAULT_TEMPLATES } from '@/types/email-templates'

// In a real app, this would be stored in a database
// For now, we'll simulate with in-memory storage
let templates: EmailTemplateConfig[] = [...DEFAULT_TEMPLATES]

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')
    
    let filteredTemplates = templates
    
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category)
    }
    
    if (active !== null) {
      filteredTemplates = filteredTemplates.filter(t => t.isActive === (active === 'true'))
    }
    
    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const templateData: Omit<EmailTemplateConfig, 'id' | 'lastModified'> = await request.json()
    
    const newTemplate: EmailTemplateConfig = {
      ...templateData,
      id: `custom-${Date.now()}`,
      lastModified: new Date().toISOString()
    }
    
    templates.push(newTemplate)
    
    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

// PUT - Update existing template
export async function PUT(request: NextRequest) {
  try {
    const updatedTemplate: EmailTemplateConfig = await request.json()
    
    const index = templates.findIndex(t => t.id === updatedTemplate.id)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    templates[index] = {
      ...updatedTemplate,
      lastModified: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      template: templates[index],
      message: 'Template updated successfully'
    })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }
    
    const index = templates.findIndex(t => t.id === templateId)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    const deletedTemplate = templates.splice(index, 1)[0]
    
    return NextResponse.json({
      success: true,
      template: deletedTemplate,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
