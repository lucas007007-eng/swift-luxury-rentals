'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EnvelopeIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import EmailTemplateEditor from '@/components/EmailTemplateEditor'
import EnhancedEmailTemplateEditor from '@/components/EnhancedEmailTemplateEditor'
import TestEmailModal from '@/components/TestEmailModal'
import EmailAnalyticsDashboard from '@/components/EmailAnalyticsDashboard'
import { EmailTemplateConfig, DEFAULT_TEMPLATES } from '@/types/email-templates'
import { saveEmailTemplate, loadEmailTemplates, deleteEmailTemplate } from '@/lib/email-template-storage'

export default function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState<EmailTemplateConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateConfig | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'preview' | 'analytics'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showTestModal, setShowTestModal] = useState(false)
  const [testTemplate, setTestTemplate] = useState<EmailTemplateConfig | null>(null)

  // Load templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const result = await loadEmailTemplates()
        setTemplates(result.templates)
        console.log(`Loaded ${result.templates.length} templates via ${result.method}`)
      } catch (error) {
        console.error('Failed to load templates:', error)
        setTemplates(DEFAULT_TEMPLATES)
      } finally {
        setLoading(false)
      }
    }
    
    loadTemplates()
  }, [])

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'customer', label: 'Customer' },
    { value: 'booking', label: 'Booking' },
    { value: 'payment', label: 'Payment' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'system', label: 'System' }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading Email Templates</h2>
              <p className="text-gray-400">Decrypting template database...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      customer: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      booking: 'text-green-400 bg-green-400/10 border-green-400/20',
      payment: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      reminder: 'text-red-400 bg-red-400/10 border-red-400/20',
      system: 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    }
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      customer: '👤',
      booking: '🏢',
      payment: '💳',
      reminder: '⏰',
      system: '⚙️'
    }
    return icons[category as keyof typeof icons] || '📧'
  }

  const handleEditTemplate = (template: EmailTemplateConfig) => {
    setSelectedTemplate(template)
    setViewMode('edit')
  }

  const handlePreviewTemplate = (template: EmailTemplateConfig) => {
    setSelectedTemplate(template)
    setViewMode('preview')
  }

  const handleTestTemplate = (template: EmailTemplateConfig) => {
    setTestTemplate(template)
    setShowTestModal(true)
  }

  const handleDuplicateTemplate = (template: EmailTemplateConfig) => {
    const newTemplate: EmailTemplateConfig = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastModified: new Date().toISOString()
    }
    setTemplates([...templates, newTemplate])
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const result = await deleteEmailTemplate(templateId)
        if (result.success) {
          setTemplates(templates.filter(t => t.id !== templateId))
          console.log(`Template deleted via ${result.method}`)
        } else {
          alert('Failed to delete template')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Failed to delete template')
      }
    }
  }

  const handleToggleActive = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return
    
    const updatedTemplate = { 
      ...template, 
      isActive: !template.isActive, 
      lastModified: new Date().toISOString() 
    }
    
    try {
      const result = await saveEmailTemplate(updatedTemplate)
      if (result.success) {
        // Reload from server to ensure DB state is reflected
        const latest = await loadEmailTemplates()
        setTemplates(latest.templates)
        console.log(`Template status updated via ${result.method}`)
      } else {
        alert('Failed to update template status')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('Failed to update template status')
    }
  }

  if (viewMode === 'edit' && selectedTemplate) {
    return <EnhancedEmailTemplateEditor 
      template={selectedTemplate} 
      onSave={async (updatedTemplate) => {
        try {
          const result = await saveEmailTemplate(updatedTemplate)
          if (result.success) {
            // Reload from server to ensure DB persistence is reflected
            const latest = await loadEmailTemplates()
            setTemplates(latest.templates)
            // Keep editing; refresh the selected template in place
            setSelectedTemplate(updatedTemplate)
            console.log(`Template saved via ${result.method}`)
          } else {
            alert('Failed to save template: ' + (result.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Save error:', error)
          alert('Failed to save template')
        }
      }}
      onCancel={() => {
        setViewMode('list')
        setSelectedTemplate(null)
      }}
    />
  }

  if (viewMode === 'preview' && selectedTemplate) {
    return <EmailTemplatePreview 
      template={selectedTemplate}
      onClose={() => {
        setViewMode('list')
        setSelectedTemplate(null)
      }}
    />
  }

  if (viewMode === 'analytics') {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-white">
                📊 Email Analytics
              </h1>
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Templates
              </button>
            </div>
            
            <EmailAnalyticsDashboard />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="luxury-feature-card p-6 md:p-8 mb-8">
        <div className="flex items-center justify-between">
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-zinc-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-zinc-300/40 transition-all duration-300"
          >
            ← Return
          </a>
          <div className="text-center">
            <div className="font-mono uppercase tracking-wider text-sm text-emerald-400 font-sora">Templates</div>
            <h1 className="text-3xl md:text-4xl font-bold heading-sora text-white">Email Templates</h1>
            <p className="text-zinc-300 text-sm md:text-base">Design & Manage Email Communications</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('analytics')}
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold text-sm border border-purple-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-purple-400/50 transition-all duration-300"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button className="inline-flex items-center px-4 py-2 rounded-lg text-black font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_8px_25px_rgba(16,185,129,0.35)] hover:from-emerald-300 hover:to-cyan-300 hover:scale-105 transition-all duration-300">
              <PlusIcon className="w-4 h-4 mr-2" />
              Create New
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto px-6 pb-10">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="luxury-feature-card p-6 border border-cyan-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Total Templates</div>
            <div className="text-3xl font-bold text-white">{templates.length}</div>
          </div>
          <div className="luxury-feature-card p-6 border border-emerald-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Active Templates</div>
            <div className="text-3xl font-bold text-white">{templates.filter(t => t.isActive).length}</div>
          </div>
          <div className="luxury-feature-card p-6 border border-amber-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Categories</div>
            <div className="text-3xl font-bold text-white">{new Set(templates.map(t => t.category)).size}</div>
          </div>
          <div className="luxury-feature-card p-6 border border-purple-400/30">
            <div className="text-zinc-300 text-sm font-mono uppercase tracking-wider mb-2">Last Updated</div>
            <div className="text-lg font-bold text-white">{new Date(Math.max(...templates.map(t => new Date(t.lastModified).getTime()))).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="luxury-feature-card p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
              
              {/* Category Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black/40 text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="luxury-feature-card flex flex-col h-full"
            >
              {/* Template Header */}
              <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {template.name}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {template.isActive ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      Updated {new Date(template.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Template Content Preview */}
                <div className="p-4 flex-1">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subject Line</p>
                      <p className="text-sm text-white font-medium break-words">
                        {template.subject}
                      </p>
                    </div>
                    
                    {template.preheader && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preheader</p>
                        <p className="text-sm text-gray-400 break-words">
                          {template.preheader}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Variables</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 2).map((variable) => (
                          <span key={variable.key} className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300 truncate">
                            {variable.label}
                          </span>
                        ))}
                        {template.variables.length > 2 && (
                          <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                            +{template.variables.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Action Buttons - Bookings style */}
              <div className="px-4 py-3 bg-black/20 border-t border-white/10">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleTestTemplate(template)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50 transition-all duration-300"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Test</span>
                  </button>
                  
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-cyan-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-cyan-400/50 transition-all duration-300"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Preview</span>
                  </button>
                  
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-amber-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-amber-400/50 transition-all duration-300"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-purple-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Copy</span>
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border transition-all duration-300 ${
                      template.isActive 
                        ? 'border-red-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-red-400/50' 
                        : 'border-emerald-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-emerald-400/50'
                    }`}
                  >
                    {template.isActive ? (
                      <>
                        <XCircleIcon className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Disable</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Enable</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-white font-semibold text-xs border border-red-400/30 bg-[linear-gradient(145deg,#0a0a0a_0%,#1a1a1a_50%,#0a0a0a_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] hover:scale-105 hover:border-red-400/50 transition-all duration-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="luxury-feature-card p-8 text-center">
            <EnvelopeIcon className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-400 mb-2">
              No templates found
            </h3>
            <p className="text-zinc-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first email template'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Test Email Modal */}
      {testTemplate && (
        <TestEmailModal
          isOpen={showTestModal}
          onClose={() => {
            setShowTestModal(false)
            setTestTemplate(null)
          }}
          template={testTemplate}
        />
      )}
    </main>
  )
}


// Email Template Preview Component
function EmailTemplatePreview({ 
  template, 
  onClose 
}: {
  template: EmailTemplateConfig
  onClose: () => void
}) {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">
              👁️ Preview: {template.name}
            </h1>
            
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
            >
              Close Preview
            </button>
          </div>

          {/* Preview will show actual rendered template */}
          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6 p-6 bg-black text-white rounded-lg">
                <h2 className="text-2xl font-bold text-amber-500 mb-2">
                  {template.content.header.icon} {template.content.header.title}
                </h2>
                {template.content.header.subtitle && (
                  <p className="text-gray-400">{template.content.header.subtitle}</p>
                )}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-black">
                  {template.content.body.greeting}
                </h3>
                
                <p className="text-gray-700 leading-relaxed">
                  {template.content.body.mainMessage}
                </p>
                
                {template.content.body.callToAction && (
                  <div className="text-center">
                    <a
                      href="#"
                      className="inline-block bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      {template.content.body.callToAction.text}
                    </a>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  {template.content.footer.companyInfo}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {template.content.footer.contactInfo}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
