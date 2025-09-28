// Email Template Storage - Database + LocalStorage Fallback
import { EmailTemplateConfig } from '@/types/email-templates'

// Database operations (when Prisma is available)
async function saveToDatabase(template: EmailTemplateConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/email-templates/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    })
    if (!response.ok) return false
    // Only treat as DB success if server confirms database method
    const data = await response.json().catch(() => null)
    return data && data.method === 'database'
  } catch (error) {
    console.error('Database save failed:', error)
    return false
  }
}

async function loadFromDatabase(): Promise<EmailTemplateConfig[] | null> {
  try {
    const response = await fetch('/api/admin/email-templates/load')
    if (!response.ok) return null
    const data = await response.json()
    // Accept any templates the API returns (database or defaults)
    return Array.isArray(data?.templates) ? data.templates : null
    return null
  } catch (error) {
    console.error('Database load failed:', error)
    return null
  }
}

// LocalStorage fallback operations
function saveToLocalStorage(template: EmailTemplateConfig): boolean {
  try {
    const key = 'email_templates'
    const existing = localStorage.getItem(key)
    let templates: EmailTemplateConfig[] = existing ? JSON.parse(existing) : []
    
    // Update existing or add new
    const index = templates.findIndex(t => t.id === template.id)
    if (index >= 0) {
      templates[index] = template
    } else {
      templates.push(template)
    }
    
    localStorage.setItem(key, JSON.stringify(templates))
    return true
  } catch (error) {
    console.error('LocalStorage save failed:', error)
    return false
  }
}

function loadFromLocalStorage(): EmailTemplateConfig[] {
  try {
    const key = 'email_templates'
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('LocalStorage load failed:', error)
    return []
  }
}

function deleteFromLocalStorage(templateId: string): boolean {
  try {
    const key = 'email_templates'
    const existing = localStorage.getItem(key)
    if (!existing) return true
    
    const templates: EmailTemplateConfig[] = JSON.parse(existing)
    const filtered = templates.filter(t => t.id !== templateId)
    
    localStorage.setItem(key, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('LocalStorage delete failed:', error)
    return false
  }
}

// Main storage service - tries database first, falls back to localStorage
export class EmailTemplateStorage {
  static async saveTemplate(template: EmailTemplateConfig): Promise<{
    success: boolean
    method: 'database' | 'localStorage'
    error?: string
  }> {
    // Try database first
    const dbSuccess = await saveToDatabase(template)
    // Always keep a local copy so the UI reflects changes immediately even if DB is offline
    saveToLocalStorage(template)
    if (dbSuccess) return { success: true, method: 'database' }
    // If DB failed but local saved, report localStorage
    if (typeof window !== 'undefined') return { success: true, method: 'localStorage' }
    
    return { 
      success: false, 
      method: 'localStorage', 
      error: 'Both database and localStorage failed' 
    }
  }
  
  static async loadTemplates(): Promise<{
    templates: EmailTemplateConfig[]
    method: 'database' | 'localStorage'
  }> {
    // Prefer database if truly from DB
    let dbTemplates: EmailTemplateConfig[] | null = null
    try {
      const resp = await fetch('/api/admin/email-templates/load')
      if (resp.ok) {
        const data = await resp.json()
        if (Array.isArray(data?.templates)) {
          // If API says 'database', use it; if it's defaults, we may prefer local if present
          if (data.method === 'database') {
            return { templates: data.templates, method: 'database' }
          }
          dbTemplates = data.templates
        }
      }
    } catch {}

    // Check localStorage (client-only)
    const localTemplates = loadFromLocalStorage()
    if (localTemplates.length > 0) {
      return { templates: localTemplates, method: 'localStorage' }
    }

    // Fall back to what the API returned (likely defaults) if present
    if (dbTemplates && dbTemplates.length > 0) {
      return { templates: dbTemplates, method: 'database' }
    }

    // Nothing found
    return { templates: [], method: 'localStorage' }
  }
  
  static async deleteTemplate(templateId: string): Promise<{
    success: boolean
    method: 'database' | 'localStorage'
  }> {
    // Try database first
    try {
      const response = await fetch(`/api/admin/email-templates/delete?id=${templateId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        return { success: true, method: 'database' }
      }
    } catch (error) {
      console.error('Database delete failed:', error)
    }
    
    // Fallback to localStorage
    const localSuccess = deleteFromLocalStorage(templateId)
    return { success: localSuccess, method: 'localStorage' }
  }
  
  static async initializeDefaultTemplates(defaultTemplates: EmailTemplateConfig[]): Promise<void> {
    const { templates } = await this.loadTemplates()
    
    // Only initialize if no templates exist
    if (templates.length === 0) {
      console.log('Initializing default email templates...')
      for (const template of defaultTemplates) {
        await this.saveTemplate(template)
      }
    }
  }
}

// Utility functions for easy use
export const saveEmailTemplate = (template: EmailTemplateConfig) => 
  EmailTemplateStorage.saveTemplate(template)

export const loadEmailTemplates = () => 
  EmailTemplateStorage.loadTemplates()

export const deleteEmailTemplate = (templateId: string) => 
  EmailTemplateStorage.deleteTemplate(templateId)

export const initializeTemplates = (defaultTemplates: EmailTemplateConfig[]) =>
  EmailTemplateStorage.initializeDefaultTemplates(defaultTemplates)
