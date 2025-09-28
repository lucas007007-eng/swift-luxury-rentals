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
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  📧 Email Templates
                </h1>
                <p className="text-gray-400">
                  Design and manage your email templates with spy-tech precision
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('analytics')}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
                >
                  <ChartBarIcon className="w-5 h-5" />
                  Analytics
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create New Template
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
                <EnvelopeIcon className="w-8 h-8 text-amber-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-black border border-green-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Templates</p>
                  <p className="text-2xl font-bold text-green-400">
                    {templates.filter(t => t.isActive).length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Categories</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {new Set(templates.map(t => t.category)).size}
                  </p>
                </div>
                <div className="text-2xl">📋</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-800/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last Updated</p>
                  <p className="text-sm font-semibold text-purple-400">
                    {new Date(Math.max(...templates.map(t => new Date(t.lastModified).getTime()))).toLocaleDateString()}
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
              
              {/* Category Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Templates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors group"
              >
                {/* Template Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
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
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subject Line</p>
                      <p className="text-sm text-white font-medium">
                        {template.subject}
                      </p>
                    </div>
                    
                    {template.preheader && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preheader</p>
                        <p className="text-sm text-gray-400">
                          {template.preheader}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Variables</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <span key={variable.key} className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                            {variable.label}
                          </span>
                        ))}
                        {template.variables.length > 3 && (
                          <span className="px-2 py-1 bg-gray-800 text-xs rounded text-gray-300">
                            +{template.variables.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestTemplate(template)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <EnvelopeIcon className="w-4 h-4" />
                      Test
                    </button>
                    
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Preview
                    </button>
                    
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <DocumentDuplicateIcon className="w-4 h-4" />
                      Copy
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(template.id)}
                      className={`flex items-center gap-1 px-3 py-2 text-xs rounded-lg transition-colors ${
                        template.isActive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {template.isActive ? 'Disable' : 'Enable'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors ml-auto"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filteredTemplates.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <EnvelopeIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No templates found
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first email template'
                }
              </p>
            </motion.div>
          )}
        </div>
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
    </div>
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
