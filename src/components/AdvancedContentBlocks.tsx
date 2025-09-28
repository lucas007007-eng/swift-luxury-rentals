'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  MinusIcon,
  ShareIcon,
  RectangleStackIcon,
  Bars3Icon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

// Enhanced Block Types
export interface AdvancedEmailBlock {
  id: string
  type: 'text' | 'heading' | 'image' | 'button' | 'divider' | 'social' | 'spacer' | 'columns'
  content: any
  styling: {
    padding: string
    margin: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
    fontSize?: string
    fontWeight?: string
    fontFamily?: string
    color?: string
    borderRadius?: string
    border?: string
  }
}

// Font options
export const FONT_OPTIONS = [
  { value: 'Sora, sans-serif', label: 'Sora (Brand Font)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' }
]

// Font size options
export const FONT_SIZE_OPTIONS = [
  { value: '12px', label: 'Small (12px)' },
  { value: '14px', label: 'Normal (14px)' },
  { value: '16px', label: 'Medium (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'X-Large (20px)' },
  { value: '24px', label: 'XX-Large (24px)' },
  { value: '28px', label: 'Heading 1 (28px)' },
  { value: '24px', label: 'Heading 2 (24px)' },
  { value: '20px', label: 'Heading 3 (20px)' }
]

// Font weight options
export const FONT_WEIGHT_OPTIONS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' }
]

// Enhanced block templates
export const ADVANCED_BLOCK_TEMPLATES = [
  {
    type: 'heading',
    icon: Bars3Icon,
    label: 'Heading',
    category: 'text',
    defaultContent: {
      text: 'Your Heading Here',
      level: 'h2',
      fontSize: '24px',
      fontWeight: '700',
      color: '#f59e0b',
      textAlign: 'left'
    }
  },
  {
    type: 'text',
    icon: DocumentTextIcon,
    label: 'Text Block',
    category: 'text',
    defaultContent: {
      text: 'Your text content here. You can format this text with different fonts, sizes, and colors.',
      fontSize: '16px',
      fontWeight: '400',
      color: '#cccccc',
      lineHeight: '1.6'
    }
  },
  {
    type: 'image',
    icon: PhotoIcon,
    label: 'Image Block',
    category: 'media',
    defaultContent: {
      src: '',
      alt: 'Image description',
      width: '100%',
      height: 'auto',
      link: '',
      caption: ''
    }
  },
  {
    type: 'button',
    icon: LinkIcon,
    label: 'Call-to-Action Button',
    category: 'interactive',
    defaultContent: {
      text: 'Click Here',
      link: '#',
      backgroundColor: '#f59e0b',
      textColor: '#000000',
      borderRadius: '6px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '600'
    }
  },
  {
    type: 'divider',
    icon: MinusIcon,
    label: 'Divider Line',
    category: 'layout',
    defaultContent: {
      height: '2px',
      color: '#333333',
      style: 'solid',
      width: '100%'
    }
  },
  {
    type: 'spacer',
    icon: RectangleStackIcon,
    label: 'Spacer',
    category: 'layout',
    defaultContent: {
      height: '20px'
    }
  },
  {
    type: 'social',
    icon: ShareIcon,
    label: 'Social Links',
    category: 'interactive',
    defaultContent: {
      links: [
        { platform: 'twitter', url: '#', icon: '🐦' },
        { platform: 'instagram', url: '#', icon: '📷' },
        { platform: 'facebook', url: '#', icon: '📘' },
        { platform: 'linkedin', url: '#', icon: '💼' }
      ],
      iconSize: '24px'
    }
  }
]

// Advanced Block Editor Component
interface AdvancedBlockEditorProps {
  block: AdvancedEmailBlock
  onUpdate: (block: AdvancedEmailBlock) => void
  onDelete: () => void
}

export function AdvancedBlockEditor({ block, onUpdate, onDelete }: AdvancedBlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateBlockContent = (updates: any) => {
    onUpdate({
      ...block,
      content: { ...block.content, ...updates }
    })
  }

  const updateBlockStyling = (updates: any) => {
    onUpdate({
      ...block,
      styling: { ...block.styling, ...updates }
    })
  }

  const renderBlockEditor = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
              <input
                type="text"
                value={block.content.text}
                onChange={(e) => updateBlockContent({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your heading"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={block.content.fontSize}
                  onChange={(e) => updateBlockContent({ fontSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_SIZE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                <select
                  value={block.content.fontWeight}
                  onChange={(e) => updateBlockContent({ fontWeight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_WEIGHT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.content.color}
                    onChange={(e) => updateBlockContent({ color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={block.content.color}
                    onChange={(e) => updateBlockContent({ color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
                <select
                  value={block.styling.textAlign}
                  onChange={(e) => updateBlockStyling({ textAlign: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
              <textarea
                value={block.content.text}
                onChange={(e) => updateBlockContent({ text: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your text content"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={block.styling.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateBlockStyling({ fontFamily: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={block.styling.fontSize || '16px'}
                  onChange={(e) => updateBlockStyling({ fontSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_SIZE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                <select
                  value={block.styling.fontWeight || '400'}
                  onChange={(e) => updateBlockStyling({ fontWeight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_WEIGHT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.styling.color || '#cccccc'}
                    onChange={(e) => updateBlockStyling({ color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={block.styling.color || '#cccccc'}
                    onChange={(e) => updateBlockStyling({ color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
                <select
                  value={block.styling.textAlign || 'left'}
                  onChange={(e) => updateBlockStyling({ textAlign: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Source</label>
              <input
                type="url"
                value={block.content.src}
                onChange={(e) => updateBlockContent({ src: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://example.com/image.jpg or drag & drop"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={block.content.alt}
                  onChange={(e) => updateBlockContent({ alt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Describe the image"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                <input
                  type="url"
                  value={block.content.link || ''}
                  onChange={(e) => updateBlockContent({ link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
                <select
                  value={block.content.width}
                  onChange={(e) => updateBlockContent({ width: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="100%">Full Width (100%)</option>
                  <option value="75%">Three Quarters (75%)</option>
                  <option value="50%">Half Width (50%)</option>
                  <option value="25%">Quarter Width (25%)</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                <select
                  value={block.styling.textAlign || 'center'}
                  onChange={(e) => updateBlockStyling({ textAlign: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                <input
                  type="text"
                  value={block.content.text}
                  onChange={(e) => updateBlockContent({ text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Click Here"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                <input
                  type="url"
                  value={block.content.link}
                  onChange={(e) => updateBlockContent({ link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.content.backgroundColor}
                    onChange={(e) => updateBlockContent({ backgroundColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={block.content.backgroundColor}
                    onChange={(e) => updateBlockContent({ backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={block.content.textColor}
                    onChange={(e) => updateBlockContent({ textColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={block.content.textColor}
                    onChange={(e) => updateBlockContent({ textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={block.content.fontSize || '16px'}
                  onChange={(e) => updateBlockContent({ fontSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FONT_SIZE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                <select
                  value={block.content.borderRadius}
                  onChange={(e) => updateBlockContent({ borderRadius: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="0px">Square</option>
                  <option value="4px">Small (4px)</option>
                  <option value="6px">Medium (6px)</option>
                  <option value="8px">Large (8px)</option>
                  <option value="12px">X-Large (12px)</option>
                  <option value="24px">Pill (24px)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                <select
                  value={block.styling.textAlign || 'center'}
                  onChange={(e) => updateBlockStyling({ textAlign: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Spacer Height</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={parseInt(block.content.height.replace('px', ''))}
                  onChange={(e) => updateBlockContent({ height: `${e.target.value}px` })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-16">
                  {block.content.height}
                </span>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center text-gray-500 py-4">
            <p>Advanced editor for {block.type} block coming soon</p>
          </div>
        )
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Block Header */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 capitalize">
            {block.type} Block
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Block Editor */}
      {isExpanded && (
        <div className="p-4 bg-white email-editor">
          {renderBlockEditor()}
        </div>
      )}
    </div>
  )
}

// Template Gallery Component
export function TemplateGallery({ 
  onSelectTemplate 
}: { 
  onSelectTemplate: (template: any) => void 
}) {
  const templates = [
    {
      id: 'luxury-welcome',
      name: 'Luxury Welcome',
      category: 'customer',
      thumbnail: '/api/placeholder/300/200',
      description: 'Premium welcome email with VIP styling'
    },
    {
      id: 'booking-confirmation',
      name: 'Booking Confirmed',
      category: 'booking',
      thumbnail: '/api/placeholder/300/200',
      description: 'Professional booking confirmation layout'
    },
    {
      id: 'payment-reminder',
      name: 'Payment Reminder',
      category: 'payment',
      thumbnail: '/api/placeholder/300/200',
      description: 'Urgent payment reminder with clear CTA'
    }
  ]

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Choose a Template</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="aspect-video bg-gray-100 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {template.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
