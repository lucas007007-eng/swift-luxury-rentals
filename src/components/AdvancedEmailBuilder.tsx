'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon,
  LinkIcon,
  MinusIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  EnvelopeIcon,
  Bars3Icon,
  RectangleStackIcon,
  ShareIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { EmailTemplateConfig } from '@/types/email-templates'
import { AdvancedBlockEditor, ADVANCED_BLOCK_TEMPLATES, TemplateGallery } from './AdvancedContentBlocks'
import TestEmailModal from './TestEmailModal'

interface AdvancedEmailBuilderProps {
  template: EmailTemplateConfig
  onSave: (template: EmailTemplateConfig) => void
  onCancel: () => void
}

export default function AdvancedEmailBuilder({ 
  template, 
  onSave, 
  onCancel 
}: AdvancedEmailBuilderProps) {
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplateConfig>(template)
  const [activeView, setActiveView] = useState<'builder' | 'templates' | 'settings'>('builder')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showTestModal, setShowTestModal] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  // Email structure state - properly typed
  interface EmailStructure {
    header: {
      showLogo: boolean
      title: string
      subtitle?: string
      backgroundColor: string
      textColor: string
    }
    body: {
      blocks: Array<{
        id: string
        type: string
        content: any
        styling: any
      }>
    }
    footer: {
      companyInfo: string
      contactInfo: string
      backgroundColor: string
      textColor: string
    }
  }

  const [emailStructure, setEmailStructure] = useState<EmailStructure>({
    header: {
      showLogo: true,
      title: activeTemplate.content.header.title,
      subtitle: activeTemplate.content.header.subtitle,
      backgroundColor: activeTemplate.styling.primaryColor,
      textColor: '#ffffff'
    },
    body: {
      blocks: [
        {
          id: 'greeting',
          type: 'heading',
          content: {
            text: activeTemplate.content.body.greeting,
            fontSize: '24px',
            fontWeight: '600',
            color: activeTemplate.styling.primaryColor
          },
          styling: {
            padding: '20px',
            margin: '0px',
            textAlign: 'left'
          }
        },
        {
          id: 'main-message',
          type: 'text',
          content: {
            text: activeTemplate.content.body.mainMessage,
            fontSize: '16px',
            fontWeight: '400',
            color: '#cccccc'
          },
          styling: {
            padding: '20px',
            margin: '0px',
            textAlign: 'left',
            fontFamily: activeTemplate.styling.fontFamily
          }
        }
      ]
    },
    footer: {
      companyInfo: activeTemplate.content.footer.companyInfo,
      contactInfo: activeTemplate.content.footer.contactInfo,
      backgroundColor: '#0a0a0a',
      textColor: '#666666'
    }
  })

  const addBlock = (blockType: string) => {
    const blockTemplate = ADVANCED_BLOCK_TEMPLATES.find(t => t.type === blockType)
    if (!blockTemplate) return

    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      content: { ...blockTemplate.defaultContent },
      styling: {
        padding: '15px',
        margin: '5px 0',
        textAlign: 'left' as any,
        fontFamily: activeTemplate.styling.fontFamily,
        fontSize: '16px',
        fontWeight: '400',
        color: activeTemplate.styling.textColor
      }
    }

    setEmailStructure(prev => ({
      ...prev,
      body: {
        ...prev.body,
        blocks: [...prev.body.blocks, newBlock]
      }
    }))
  }

  const updateBlock = (blockId: string, updates: any) => {
    setEmailStructure(prev => ({
      ...prev,
      body: {
        ...prev.body,
        blocks: prev.body.blocks.map(block =>
          block.id === blockId ? { ...block, ...updates } : block
        )
      }
    }))
  }

  const deleteBlock = (blockId: string) => {
    setEmailStructure(prev => ({
      ...prev,
      body: {
        ...prev.body,
        blocks: prev.body.blocks.filter(block => block.id !== blockId)
      }
    }))
  }

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setEmailStructure((prev: EmailStructure) => {
      const blocks = [...prev.body.blocks]
      const index = blocks.findIndex(b => b.id === blockId)

      if (index === -1) return prev

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= blocks.length) return prev

      // Swap blocks
      const temp = blocks[index]
      blocks[index] = blocks[newIndex]
      blocks[newIndex] = temp

      return {
        ...prev,
        body: {
          ...prev.body,
          blocks: blocks as any[]
        }
      }
    })
  }

  const renderEmailPreview = () => {
    return (
      <div className="bg-white shadow-xl rounded-lg overflow-hidden mx-auto" 
           style={{ maxWidth: previewMode === 'mobile' ? '375px' : '600px' }}>
        
        {/* Email Header */}
        <div 
          className="text-center p-8"
          style={{
            backgroundColor: emailStructure.header.backgroundColor,
            color: emailStructure.header.textColor
          }}
        >
          {emailStructure.header.showLogo && (
            <div className="text-3xl mb-2">🎯</div>
          )}
          <h1 className="text-2xl font-bold mb-2">
            {emailStructure.header.title}
          </h1>
          {emailStructure.header.subtitle && (
            <p className="opacity-90">{emailStructure.header.subtitle}</p>
          )}
        </div>

        {/* Email Body */}
        <div className="bg-black text-white">
          {emailStructure.body.blocks.map((block) => (
            <div
              key={block.id}
              className={`relative group ${selectedBlock === block.id ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                padding: block.styling.padding,
                margin: block.styling.margin,
                backgroundColor: block.styling.backgroundColor,
                textAlign: block.styling.textAlign
              }}
              onClick={() => setSelectedBlock(block.id)}
            >
              {/* Block Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBlock(block.id, 'up')
                  }}
                  className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBlock(block.id, 'down')
                  }}
                  className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBlock(block.id)
                  }}
                  className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700"
                >
                  ×
                </button>
              </div>

              {/* Block Content */}
              {block.type === 'heading' && (
                <h2 
                  style={{
                    fontSize: block.content.fontSize,
                    fontWeight: block.content.fontWeight,
                    color: block.content.color,
                    fontFamily: block.styling.fontFamily
                  }}
                >
                  {block.content.text}
                </h2>
              )}

              {block.type === 'text' && (
                <p 
                  style={{
                    fontSize: block.styling.fontSize,
                    fontWeight: block.styling.fontWeight,
                    color: block.styling.color,
                    fontFamily: block.styling.fontFamily,
                    lineHeight: '1.6'
                  }}
                >
                  {block.content.text}
                </p>
              )}

              {block.type === 'image' && (
                <div style={{ textAlign: block.styling.textAlign }}>
                  {block.content.src ? (
                    <img
                      src={block.content.src}
                      alt={block.content.alt}
                      style={{
                        width: block.content.width,
                        height: block.content.height,
                        borderRadius: block.styling.borderRadius
                      }}
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 p-8 text-center rounded-lg">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Click to add image</p>
                    </div>
                  )}
                </div>
              )}

              {block.type === 'button' && (
                <div style={{ textAlign: block.styling.textAlign }}>
                  <a
                    href={block.content.link}
                    style={{
                      display: 'inline-block',
                      backgroundColor: block.content.backgroundColor,
                      color: block.content.textColor,
                      padding: block.content.padding,
                      borderRadius: block.content.borderRadius,
                      textDecoration: 'none',
                      fontSize: block.content.fontSize,
                      fontWeight: block.content.fontWeight
                    }}
                  >
                    {block.content.text}
                  </a>
                </div>
              )}

              {block.type === 'divider' && (
                <hr
                  style={{
                    height: block.content.height,
                    backgroundColor: block.content.color,
                    border: 'none',
                    width: block.content.width
                  }}
                />
              )}

              {block.type === 'spacer' && (
                <div 
                  style={{ height: block.content.height }}
                  className="bg-gray-800 bg-opacity-20 border border-dashed border-gray-600 flex items-center justify-center"
                >
                  <span className="text-xs text-gray-500">
                    Spacer ({block.content.height})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Email Footer */}
        <div 
          className="text-center p-6 text-sm border-t"
          style={{
            backgroundColor: emailStructure.footer.backgroundColor,
            color: emailStructure.footer.textColor
          }}
        >
          <p className="mb-2">{emailStructure.footer.companyInfo}</p>
          <p>{emailStructure.footer.contactInfo}</p>
        </div>
      </div>
    )
  }

  if (activeView === 'templates') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">📧 Email Templates</h1>
            <button
              onClick={() => setActiveView('builder')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Builder
            </button>
          </div>
        </div>
        
        <TemplateGallery 
          onSelectTemplate={(template) => {
            // Load selected template
            setActiveView('builder')
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">
              📧 {activeTemplate.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'desktop' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <ComputerDesktopIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  previewMode === 'mobile' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <DevicePhoneMobileIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('templates')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Templates
            </button>
            <button
              onClick={() => setShowTestModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4" />
              Test Email
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(activeTemplate)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Sidebar - Content Blocks */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Block Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Blocks</h3>
              
              {['text', 'media', 'interactive', 'layout'].map(category => (
                <div key={category} className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                  <div className="space-y-2">
                    {ADVANCED_BLOCK_TEMPLATES
                      .filter(block => block.category === category)
                      .map((block) => {
                        const Icon = block.icon
                        return (
                          <button
                            key={block.type}
                            onClick={() => addBlock(block.type)}
                            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                          >
                            <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-700">
                              {block.label}
                            </span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Global Settings */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Settings</h3>
              
              <div className="space-y-4 email-editor">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={activeTemplate.subject}
                    onChange={(e) => setActiveTemplate(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900"
                    placeholder="Email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={activeTemplate.styling.primaryColor}
                    onChange={(e) => setActiveTemplate(prev => ({
                      ...prev,
                      styling: { ...prev.styling, primaryColor: e.target.value }
                    }))}
                    className="w-full h-10 border border-gray-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Preview</h2>
            <p className="text-gray-600">Click on any element to edit its properties</p>
          </div>

          {renderEmailPreview()}
        </div>

        {/* Right Sidebar - Property Editor */}
        {selectedBlock && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Block Properties</h3>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {(() => {
              const block = emailStructure.body.blocks.find(b => b.id === selectedBlock)
              return block ? (
                <AdvancedBlockEditor
                  block={block as any}
                  onUpdate={(updatedBlock) => updateBlock(selectedBlock, updatedBlock)}
                  onDelete={() => {
                    deleteBlock(selectedBlock)
                    setSelectedBlock(null)
                  }}
                />
              ) : null
            })()}
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      <TestEmailModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        template={activeTemplate}
      />
    </div>
  )
}
