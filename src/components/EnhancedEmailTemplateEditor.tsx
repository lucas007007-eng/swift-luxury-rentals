'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeIcon,
  CodeBracketIcon,
  SwatchIcon,
  VariableIcon,
  Cog6ToothIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { EmailTemplateConfig } from '@/types/email-templates'
import DragDropEmailBuilder, { EmailTemplate as DragDropTemplate } from './DragDropEmailBuilder'
import AdvancedEmailBuilder from './AdvancedEmailBuilder'
import TestEmailModal from './TestEmailModal'
import { FONT_OPTIONS } from './AdvancedContentBlocks'

interface EnhancedEmailTemplateEditorProps {
  template: EmailTemplateConfig
  onSave: (template: EmailTemplateConfig) => void
  onCancel: () => void
}

export default function EnhancedEmailTemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: EnhancedEmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'builder' | 'content' | 'variables' | 'styling' | 'preview'>('builder')
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplateConfig>({ ...template })
  const [showTestEmailModal, setShowTestEmailModal] = useState(false)

  // Convert template to drag-drop format
  const [dragDropTemplate, setDragDropTemplate] = useState<DragDropTemplate>({
    id: template.id,
    name: template.name,
    subject: template.subject,
    preheader: template.preheader,
    rows: [], // Will be populated from existing template content
    globalStyling: {
      fontFamily: template.styling.fontFamily,
      primaryColor: template.styling.primaryColor,
      secondaryColor: template.styling.secondaryColor,
      backgroundColor: template.styling.backgroundColor,
      textColor: template.styling.textColor,
      containerWidth: 600
    }
  })

  const tabs = [
    { id: 'builder', label: 'Visual Builder', icon: PhotoIcon },
    { id: 'content', label: 'Content', icon: CodeBracketIcon },
    { id: 'variables', label: 'Variables', icon: VariableIcon },
    { id: 'styling', label: 'Styling', icon: SwatchIcon },
    { id: 'preview', label: 'Preview', icon: EyeIcon }
  ]

  const handleDragDropSave = (updatedTemplate: DragDropTemplate) => {
    setDragDropTemplate(updatedTemplate)
    // Convert back to original format and update editedTemplate
    // This is where we'd convert the drag-drop format back to the original template format
  }

  const handleDragDropPreview = (template: DragDropTemplate) => {
    // Generate preview from drag-drop template
    console.log('Preview template:', template)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'builder':
        return (
          <div className="h-full">
            <DragDropEmailBuilder
              template={dragDropTemplate}
              onSave={handleDragDropSave}
              onPreview={handleDragDropPreview}
            />
          </div>
        )

      case 'content':
        return (
          <div className="p-6 space-y-6 email-editor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="bg-gray-50 border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.name}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editedTemplate.description}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editedTemplate.category}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="customer">Customer</option>
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="reminder">Reminder</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editedTemplate.isActive}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active Template
                    </label>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-gray-50 border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.subject}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Use {{variableName}} for dynamic content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.preheader || ''}
                      onChange={(e) => setEditedTemplate(prev => ({ ...prev, preheader: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Preview text shown in email clients"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl">
              <PhotoIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Use the Visual Builder
              </h3>
              <p className="text-gray-600 mb-4">
                Switch to the Visual Builder tab to design your email with drag-and-drop functionality
              </p>
              <button
                onClick={() => setActiveTab('builder')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Open Visual Builder
              </button>
            </div>
          </div>
        )

      case 'variables':
        return (
          <div className="p-6 email-editor">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Template Variables</h3>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Variable
              </button>
            </div>
            
            <div className="bg-gray-50 border rounded-xl p-6">
              <p className="text-gray-600">
                Variables will be managed through the Visual Builder interface.
                Use the Builder tab to add dynamic content blocks.
              </p>
            </div>
          </div>
        )

      case 'styling':
        return (
          <div className="p-6 space-y-6 email-editor">
            <h3 className="text-xl font-semibold text-gray-900">Global Template Styling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Colors</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editedTemplate.styling.primaryColor}
                        onChange={(e) => setEditedTemplate(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={editedTemplate.styling.primaryColor}
                        onChange={(e) => setEditedTemplate(prev => ({
                          ...prev,
                          styling: { ...prev.styling, primaryColor: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={editedTemplate.styling.secondaryColor}
                        onChange={(e) => setEditedTemplate(prev => ({
                          ...prev,
                          styling: { ...prev.styling, secondaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        value={editedTemplate.styling.secondaryColor}
                        onChange={(e) => setEditedTemplate(prev => ({
                          ...prev,
                          styling: { ...prev.styling, secondaryColor: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Typography</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                    <select
                      value={editedTemplate.styling.fontFamily}
                      onChange={(e) => setEditedTemplate(prev => ({
                        ...prev,
                        styling: { ...prev.styling, fontFamily: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      {FONT_OPTIONS.map(font => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                    <select
                      value={editedTemplate.styling.spacing}
                      onChange={(e) => setEditedTemplate(prev => ({
                        ...prev,
                        styling: { ...prev.styling, spacing: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'preview':
        return (
          <div className="p-6 email-editor">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Template Preview</h3>
              <p className="text-gray-600">
                Use the Visual Builder to create and preview your email template
              </p>
            </div>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Preview will be available after building your email in the Visual Builder
              </p>
              <button
                onClick={() => setActiveTab('builder')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Start Building
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (activeTab === 'builder') {
    return (
      <AdvancedEmailBuilder
        template={editedTemplate}
        onSave={(template) => {
          setEditedTemplate(template)
          onSave({ ...template, lastModified: new Date().toISOString() })
        }}
        onCancel={onCancel}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ✏️ Edit Template: {editedTemplate.name}
              </h1>
              <p className="text-gray-600 mt-1">{editedTemplate.description}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTestEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Test Email
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => onSave({ ...editedTemplate, lastModified: new Date().toISOString() })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white border-t-2 border-blue-500 text-blue-600 border-l border-r border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {renderTabContent()}
      </div>

      {/* Test Email Modal */}
      <TestEmailModal
        isOpen={showTestEmailModal}
        onClose={() => setShowTestEmailModal(false)}
        template={editedTemplate}
      />
    </div>
  )
}
