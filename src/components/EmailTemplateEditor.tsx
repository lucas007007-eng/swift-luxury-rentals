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
  XMarkIcon
} from '@heroicons/react/24/outline'
import { EmailTemplateConfig, TemplateVariable } from '@/types/email-templates'

interface EmailTemplateEditorProps {
  template: EmailTemplateConfig
  onSave: (template: EmailTemplateConfig) => void
  onCancel: () => void
}

export default function EmailTemplateEditor({ template, onSave, onCancel }: EmailTemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'variables' | 'styling' | 'preview'>('content')
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplateConfig>({ ...template })
  const [previewData, setPreviewData] = useState<Record<string, any>>({})

  const tabs = [
    { id: 'content', label: 'Content', icon: CodeBracketIcon },
    { id: 'variables', label: 'Variables', icon: VariableIcon },
    { id: 'styling', label: 'Styling', icon: SwatchIcon },
    { id: 'preview', label: 'Preview', icon: EyeIcon }
  ]

  const updateTemplate = (updates: Partial<EmailTemplateConfig>) => {
    setEditedTemplate(prev => ({ ...prev, ...updates }))
  }

  const addVariable = () => {
    const newVariable: TemplateVariable = {
      key: `var_${Date.now()}`,
      label: 'New Variable',
      type: 'text',
      required: false,
      placeholder: 'Enter value...'
    }
    
    updateTemplate({
      variables: [...editedTemplate.variables, newVariable]
    })
  }

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updatedVariables = editedTemplate.variables.map((variable, i) => 
      i === index ? { ...variable, ...updates } : variable
    )
    updateTemplate({ variables: updatedVariables })
  }

  const removeVariable = (index: number) => {
    const updatedVariables = editedTemplate.variables.filter((_, i) => i !== index)
    updateTemplate({ variables: updatedVariables })
  }

  const generatePreviewData = () => {
    const data: Record<string, any> = {}
    editedTemplate.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          data[variable.key] = variable.defaultValue || variable.placeholder || 'Sample Text'
          break
        case 'email':
          data[variable.key] = 'customer@example.com'
          break
        case 'date':
          data[variable.key] = new Date().toLocaleDateString()
          break
        case 'number':
          data[variable.key] = variable.defaultValue || 42
          break
        case 'currency':
          data[variable.key] = variable.defaultValue || 299
          break
        case 'boolean':
          data[variable.key] = variable.defaultValue || true
          break
        default:
          data[variable.key] = variable.defaultValue || 'Sample Value'
      }
    })
    setPreviewData(data)
  }

  const renderVariableField = (variable: TemplateVariable, value: any, onChange: (value: any) => void) => {
    switch (variable.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm text-gray-300">{variable.label}</span>
          </label>
        )
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        )
      case 'number':
      case 'currency':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={variable.placeholder}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        )
      default:
        return (
          <input
            type={variable.type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={variable.placeholder}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        )
    }
  }

  const replaceVariables = (text: string, data: Record<string, any>) => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match
    })
  }

  React.useEffect(() => {
    generatePreviewData()
  }, [editedTemplate.variables])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                ✏️ Edit Template: {editedTemplate.name}
              </h1>
              <p className="text-gray-400 mt-1">{editedTemplate.description}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={() => onSave({ ...editedTemplate, lastModified: new Date().toISOString() })}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
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
                      ? 'bg-black border-t-2 border-amber-500 text-white'
                      : 'text-gray-400 hover:text-gray-300'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Content Tab */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Settings */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Basic Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.name}
                      onChange={(e) => updateTemplate({ name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editedTemplate.description}
                      onChange={(e) => updateTemplate({ description: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editedTemplate.category}
                      onChange={(e) => updateTemplate({ category: e.target.value as any })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="booking">Booking</option>
                      <option value="payment">Payment</option>
                      <option value="reminder">Reminder</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editedTemplate.isActive}
                        onChange={(e) => updateTemplate({ isActive: e.target.checked })}
                        className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm text-gray-300">Active Template</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Email Settings */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Email Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.subject}
                      onChange={(e) => updateTemplate({ subject: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Use {{variableName}} for dynamic content"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      value={editedTemplate.preheader || ''}
                      onChange={(e) => updateTemplate({ preheader: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Preview text shown in email clients"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Content Sections</h3>
              <div className="space-y-6">
                {/* Header */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-amber-400 mb-3">Header</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                      <input
                        type="text"
                        value={editedTemplate.content.header.title}
                        onChange={(e) => updateTemplate({
                          content: {
                            ...editedTemplate.content,
                            header: { ...editedTemplate.content.header, title: e.target.value }
                          }
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                      <input
                        type="text"
                        value={editedTemplate.content.header.subtitle || ''}
                        onChange={(e) => updateTemplate({
                          content: {
                            ...editedTemplate.content,
                            header: { ...editedTemplate.content.header, subtitle: e.target.value }
                          }
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-green-400 mb-3">Body</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Greeting</label>
                      <input
                        type="text"
                        value={editedTemplate.content.body.greeting}
                        onChange={(e) => updateTemplate({
                          content: {
                            ...editedTemplate.content,
                            body: { ...editedTemplate.content.body, greeting: e.target.value }
                          }
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Main Message</label>
                      <textarea
                        value={editedTemplate.content.body.mainMessage}
                        onChange={(e) => updateTemplate({
                          content: {
                            ...editedTemplate.content,
                            body: { ...editedTemplate.content.body, mainMessage: e.target.value }
                          }
                        })}
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Variables Tab */}
        {activeTab === 'variables' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Template Variables</h3>
              <button
                onClick={addVariable}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
              >
                Add Variable
              </button>
            </div>
            
            <div className="space-y-4">
              {editedTemplate.variables.map((variable, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Variable Key</label>
                      <input
                        type="text"
                        value={variable.key}
                        onChange={(e) => updateVariable(index, { key: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                      <input
                        type="text"
                        value={variable.label}
                        onChange={(e) => updateVariable(index, { label: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={variable.type}
                        onChange={(e) => updateVariable(index, { type: e.target.value as any })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="currency">Currency</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => updateVariable(index, { required: e.target.checked })}
                          className="rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-gray-300">Required</span>
                      </label>
                      <button
                        onClick={() => removeVariable(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Placeholder</label>
                      <input
                        type="text"
                        value={variable.placeholder || ''}
                        onChange={(e) => updateVariable(index, { placeholder: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <input
                        type="text"
                        value={variable.description || ''}
                        onChange={(e) => updateVariable(index, { description: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Styling Tab */}
        {activeTab === 'styling' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white">Template Styling</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4">Colors</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
                    <input
                      type="color"
                      value={editedTemplate.styling.primaryColor}
                      onChange={(e) => updateTemplate({
                        styling: { ...editedTemplate.styling, primaryColor: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
                    <input
                      type="color"
                      value={editedTemplate.styling.secondaryColor}
                      onChange={(e) => updateTemplate({
                        styling: { ...editedTemplate.styling, secondaryColor: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Accent Color</label>
                    <input
                      type="color"
                      value={editedTemplate.styling.accentColor}
                      onChange={(e) => updateTemplate({
                        styling: { ...editedTemplate.styling, accentColor: e.target.value }
                      })}
                      className="w-full h-10 bg-gray-800 border border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-medium text-white mb-4">Layout</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Spacing</label>
                    <select
                      value={editedTemplate.styling.spacing}
                      onChange={(e) => updateTemplate({
                        styling: { ...editedTemplate.styling, spacing: e.target.value as any }
                      })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Border Radius</label>
                    <select
                      value={editedTemplate.styling.borderRadius}
                      onChange={(e) => updateTemplate({
                        styling: { ...editedTemplate.styling, borderRadius: e.target.value }
                      })}
                      className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="0px">Square</option>
                      <option value="4px">Small</option>
                      <option value="8px">Medium</option>
                      <option value="12px">Large</option>
                      <option value="16px">Extra Large</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Template Preview</h3>
              <button
                onClick={generatePreviewData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Preview
              </button>
            </div>

            {/* Preview Data Controls */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-medium text-white mb-4">Preview Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedTemplate.variables.map((variable) => (
                  <div key={variable.key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {variable.label}
                    </label>
                    {renderVariableField(
                      variable,
                      previewData[variable.key],
                      (value) => setPreviewData({ ...previewData, [variable.key]: value })
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="max-w-2xl mx-auto">
                {/* Email Header */}
                <div 
                  className="text-center p-8 text-white"
                  style={{
                    backgroundColor: editedTemplate.styling.backgroundColor,
                    borderBottom: `2px solid ${editedTemplate.styling.primaryColor}`
                  }}
                >
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{ color: editedTemplate.styling.primaryColor }}
                  >
                    {editedTemplate.content.header.icon} {replaceVariables(editedTemplate.content.header.title, previewData)}
                  </h1>
                  {editedTemplate.content.header.subtitle && (
                    <p style={{ color: editedTemplate.styling.secondaryColor }}>
                      {replaceVariables(editedTemplate.content.header.subtitle, previewData)}
                    </p>
                  )}
                </div>
                
                {/* Email Body */}
                <div className="p-8 space-y-6" style={{ backgroundColor: '#0a0a0a', color: editedTemplate.styling.textColor }}>
                  <h2 
                    className="text-xl font-semibold"
                    style={{ color: editedTemplate.styling.primaryColor }}
                  >
                    {replaceVariables(editedTemplate.content.body.greeting, previewData)}
                  </h2>
                  
                  <p className="leading-relaxed" style={{ color: '#cccccc' }}>
                    {replaceVariables(editedTemplate.content.body.mainMessage, previewData)}
                  </p>
                  
                  {editedTemplate.content.body.callToAction && (
                    <div className="text-center py-6">
                      <a
                        href="#"
                        className="inline-block px-8 py-3 rounded-lg font-semibold transition-colors"
                        style={{
                          backgroundColor: editedTemplate.styling.primaryColor,
                          color: '#000000'
                        }}
                      >
                        {editedTemplate.content.body.callToAction.text}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Email Footer */}
                <div className="p-6 text-center border-t" style={{ backgroundColor: '#0a0a0a', borderColor: '#333333' }}>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    {editedTemplate.content.footer.companyInfo}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#555555' }}>
                    {editedTemplate.content.footer.contactInfo}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
