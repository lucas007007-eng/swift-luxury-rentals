'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import { useDropzone } from 'react-dropzone'
import {
  PlusIcon,
  PhotoIcon,
  DocumentTextIcon,
  LinkIcon,
  MinusIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SwatchIcon
} from '@heroicons/react/24/outline'

// Email Block Types
export interface EmailBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'spacer'
  content: any
  styling: {
    padding: string
    margin: string
    backgroundColor?: string
    textAlign?: 'left' | 'center' | 'right'
  }
}

export interface EmailRow {
  id: string
  columns: EmailColumn[]
  styling: {
    backgroundColor?: string
    padding: string
    margin: string
  }
}

export interface EmailColumn {
  id: string
  width: number // percentage
  blocks: EmailBlock[]
  styling: {
    padding: string
    backgroundColor?: string
  }
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  preheader?: string
  rows: EmailRow[]
  globalStyling: {
    fontFamily: string
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    containerWidth: number
  }
}

interface DragDropEmailBuilderProps {
  template: EmailTemplate
  onSave: (template: EmailTemplate) => void
  onPreview: (template: EmailTemplate) => void
}

export default function DragDropEmailBuilder({ 
  template, 
  onSave, 
  onPreview 
}: DragDropEmailBuilderProps) {
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplate>(template)
  const [selectedElement, setSelectedElement] = useState<{ type: string; id: string } | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [draggedItem, setDraggedItem] = useState<any>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Block Templates
  const blockTemplates = [
    {
      type: 'text',
      icon: DocumentTextIcon,
      label: 'Text Block',
      defaultContent: {
        text: 'Your text content here...',
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#333333'
      }
    },
    {
      type: 'image',
      icon: PhotoIcon,
      label: 'Image Block',
      defaultContent: {
        src: '',
        alt: 'Image description',
        width: '100%',
        height: 'auto',
        link: ''
      }
    },
    {
      type: 'button',
      icon: LinkIcon,
      label: 'Button Block',
      defaultContent: {
        text: 'Click Here',
        link: '#',
        backgroundColor: '#f59e0b',
        textColor: '#000000',
        borderRadius: '6px',
        padding: '12px 24px'
      }
    },
    {
      type: 'divider',
      icon: MinusIcon,
      label: 'Divider',
      defaultContent: {
        height: '2px',
        color: '#e5e7eb',
        style: 'solid'
      }
    }
  ]

  // Add new row
  const addRow = () => {
    const newRow: EmailRow = {
      id: `row-${Date.now()}`,
      columns: [
        {
          id: `col-${Date.now()}`,
          width: 100,
          blocks: [],
          styling: {
            padding: '20px'
          }
        }
      ],
      styling: {
        padding: '0px',
        margin: '0px'
      }
    }
    
    setActiveTemplate(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }))
  }

  // Add block to column
  const addBlockToColumn = (rowId: string, columnId: string, blockType: string) => {
    const blockTemplate = blockTemplates.find(t => t.type === blockType)
    if (!blockTemplate) return

    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type: blockType as any,
      content: blockTemplate.defaultContent,
      styling: {
        padding: '10px',
        margin: '0px',
        textAlign: 'left'
      }
    }

    setActiveTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.map(col =>
                col.id === columnId
                  ? { ...col, blocks: [...col.blocks, newBlock] }
                  : col
              )
            }
          : row
      )
    }))
  }

  // Image Upload Handler
  const onImageDrop = useCallback((acceptedFiles: File[], rowId: string, columnId: string, blockId?: string) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const dataUrl = reader.result as string
        
        if (blockId) {
          // Update existing image block
          setActiveTemplate(prev => ({
            ...prev,
            rows: prev.rows.map(row => 
              row.id === rowId 
                ? {
                    ...row,
                    columns: row.columns.map(col =>
                      col.id === columnId
                        ? {
                            ...col,
                            blocks: col.blocks.map(block =>
                              block.id === blockId
                                ? { ...block, content: { ...block.content, src: dataUrl, alt: file.name } }
                                : block
                            )
                          }
                        : col
                    )
                  }
                : row
            )
          }))
        } else {
          // Create new image block
          const newImageBlock: EmailBlock = {
            id: `block-${Date.now()}`,
            type: 'image',
            content: {
              src: dataUrl,
              alt: file.name,
              width: '100%',
              height: 'auto',
              link: ''
            },
            styling: {
              padding: '10px',
              margin: '0px',
              textAlign: 'center'
            }
          }
          
          setActiveTemplate(prev => ({
            ...prev,
            rows: prev.rows.map(row => 
              row.id === rowId 
                ? {
                    ...row,
                    columns: row.columns.map(col =>
                      col.id === columnId
                        ? { ...col, blocks: [...col.blocks, newImageBlock] }
                        : col
                    )
                  }
                : row
            )
          }))
        }
      }
      
      reader.readAsDataURL(file)
    })
  }, [])

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setDraggedItem(event.active)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      // Handle reordering logic here
      console.log('Reorder:', active.id, 'to', over?.id)
    }
    
    setDraggedItem(null)
  }

  // Split column
  const splitColumn = (rowId: string, columnId: string) => {
    setActiveTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.flatMap(col =>
                col.id === columnId
                  ? [
                      { ...col, width: col.width / 2 },
                      {
                        id: `col-${Date.now()}`,
                        width: col.width / 2,
                        blocks: [],
                        styling: { padding: '20px' }
                      }
                    ]
                  : [col]
              )
            }
          : row
      )
    }))
  }

  // Delete row
  const deleteRow = (rowId: string) => {
    setActiveTemplate(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId)
    }))
  }

  // Delete block
  const deleteBlock = (rowId: string, columnId: string, blockId: string) => {
    setActiveTemplate(prev => ({
      ...prev,
      rows: prev.rows.map(row => 
        row.id === rowId 
          ? {
              ...row,
              columns: row.columns.map(col =>
                col.id === columnId
                  ? { ...col, blocks: col.blocks.filter(block => block.id !== blockId) }
                  : col
              )
            }
          : row
      )
    }))
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
              onClick={() => onPreview(activeTemplate)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Preview
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

      <div className="flex">
        {/* Sidebar - Block Library */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Blocks</h3>
          
          <div className="space-y-3">
            {blockTemplates.map((block) => {
              const Icon = block.icon
              return (
                <div
                  key={block.type}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  draggable
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {block.label}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout</h3>
            <button
              onClick={addRow}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Add Row</span>
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 p-6">
          <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
          }`}>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext items={activeTemplate.rows} strategy={verticalListSortingStrategy}>
                {activeTemplate.rows.map((row) => (
                  <EmailRowComponent
                    key={row.id}
                    row={row}
                    onAddBlock={addBlockToColumn}
                    onSplitColumn={splitColumn}
                    onDeleteRow={deleteRow}
                    onDeleteBlock={deleteBlock}
                    onImageDrop={onImageDrop}
                    blockTemplates={blockTemplates}
                    selectedElement={selectedElement}
                    onSelectElement={setSelectedElement}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {draggedItem ? <div>Dragging...</div> : null}
              </DragOverlay>
            </DndContext>

            {/* Empty State */}
            {activeTemplate.rows.length === 0 && (
              <div className="p-12 text-center">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Building Your Email
                </h3>
                <p className="text-gray-600 mb-6">
                  Add rows and content blocks to create your email template
                </p>
                <button
                  onClick={addRow}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Add Your First Row
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Email Row Component
function EmailRowComponent({
  row,
  onAddBlock,
  onSplitColumn,
  onDeleteRow,
  onDeleteBlock,
  onImageDrop,
  blockTemplates,
  selectedElement,
  onSelectElement
}: {
  row: EmailRow
  onAddBlock: (rowId: string, columnId: string, blockType: string) => void
  onSplitColumn: (rowId: string, columnId: string) => void
  onDeleteRow: (rowId: string) => void
  onDeleteBlock: (rowId: string, columnId: string, blockId: string) => void
  onImageDrop: (files: File[], rowId: string, columnId: string, blockId?: string) => void
  blockTemplates: any[]
  selectedElement: { type: string; id: string } | null
  onSelectElement: (element: { type: string; id: string } | null) => void
}) {
  const [showControls, setShowControls] = useState(false)

  return (
    <div
      className={`group relative border-2 border-transparent hover:border-blue-200 transition-colors ${
        selectedElement?.type === 'row' && selectedElement?.id === row.id 
          ? 'border-blue-400' 
          : ''
      }`}
      onClick={() => onSelectElement({ type: 'row', id: row.id })}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Row Controls */}
      {showControls && (
        <div className="absolute -top-10 left-0 flex items-center gap-2 bg-white shadow-lg border rounded-lg px-3 py-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteRow(row.id)
            }}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete Row
          </button>
        </div>
      )}

      <div 
        className="flex"
        style={{ 
          backgroundColor: row.styling.backgroundColor,
          padding: row.styling.padding,
          margin: row.styling.margin 
        }}
      >
        {row.columns.map((column) => (
          <EmailColumnComponent
            key={column.id}
            column={column}
            rowId={row.id}
            onAddBlock={onAddBlock}
            onSplitColumn={onSplitColumn}
            onDeleteBlock={onDeleteBlock}
            onImageDrop={onImageDrop}
            blockTemplates={blockTemplates}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
          />
        ))}
      </div>
    </div>
  )
}

// Email Column Component
function EmailColumnComponent({
  column,
  rowId,
  onAddBlock,
  onSplitColumn,
  onDeleteBlock,
  onImageDrop,
  blockTemplates,
  selectedElement,
  onSelectElement
}: {
  column: EmailColumn
  rowId: string
  onAddBlock: (rowId: string, columnId: string, blockType: string) => void
  onSplitColumn: (rowId: string, columnId: string) => void
  onDeleteBlock: (rowId: string, columnId: string, blockId: string) => void
  onImageDrop: (files: File[], rowId: string, columnId: string, blockId?: string) => void
  blockTemplates: any[]
  selectedElement: { type: string; id: string } | null
  onSelectElement: (element: { type: string; id: string } | null) => void
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    onDrop: (files) => onImageDrop(files, rowId, column.id)
  })

  return (
    <div
      className={`relative border border-dashed border-gray-200 min-h-32 ${
        isDragActive ? 'border-blue-400 bg-blue-50' : ''
      }`}
      style={{ 
        width: `${column.width}%`,
        padding: column.styling.padding,
        backgroundColor: column.styling.backgroundColor 
      }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {/* Column Content */}
      {column.blocks.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          {isDragActive ? (
            <PhotoIcon className="w-8 h-8 mb-2" />
          ) : (
            <>
              <PlusIcon className="w-8 h-8 mb-2" />
              <p className="text-sm">Drop content here</p>
            </>
          )}
          
          {/* Add Block Buttons */}
          <div className="mt-4 flex flex-wrap gap-1 justify-center">
            {blockTemplates.map((block) => (
              <button
                key={block.type}
                onClick={(e) => {
                  e.stopPropagation()
                  onAddBlock(rowId, column.id, block.type)
                }}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
                title={`Add ${block.label}`}
              >
                {block.type}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {column.blocks.map((block) => (
            <EmailBlockComponent
              key={block.id}
              block={block}
              rowId={rowId}
              columnId={column.id}
              onDelete={onDeleteBlock}
              onImageDrop={onImageDrop}
              selectedElement={selectedElement}
              onSelectElement={onSelectElement}
            />
          ))}
        </div>
      )}

      {/* Column Controls */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onSplitColumn(rowId, column.id)
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white shadow-lg rounded px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-all"
      >
        Split
      </button>
    </div>
  )
}

// Email Block Component
function EmailBlockComponent({
  block,
  rowId,
  columnId,
  onDelete,
  onImageDrop,
  selectedElement,
  onSelectElement
}: {
  block: EmailBlock
  rowId: string
  columnId: string
  onDelete: (rowId: string, columnId: string, blockId: string) => void
  onImageDrop: (files: File[], rowId: string, columnId: string, blockId?: string) => void
  selectedElement: { type: string; id: string } | null
  onSelectElement: (element: { type: string; id: string } | null) => void
}) {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: block.content.fontSize,
              fontWeight: block.content.fontWeight,
              color: block.content.color,
              textAlign: block.styling.textAlign
            }}
          >
            {block.content.text}
          </div>
        )

      case 'image':
        return block.content.src ? (
          <img
            src={block.content.src}
            alt={block.content.alt}
            style={{
              width: block.content.width,
              height: block.content.height,
              display: 'block',
              margin: '0 auto'
            }}
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 p-8 text-center">
            <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click or drop an image</p>
          </div>
        )

      case 'button':
        return (
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
                fontWeight: '600'
              }}
            >
              {block.content.text}
            </a>
          </div>
        )

      case 'divider':
        return (
          <hr
            style={{
              height: block.content.height,
              backgroundColor: block.content.color,
              border: 'none',
              borderStyle: block.content.style
            }}
          />
        )

      default:
        return <div>Unknown block type: {block.type}</div>
    }
  }

  return (
    <div
      className={`relative group cursor-pointer border-2 border-transparent hover:border-blue-200 rounded ${
        selectedElement?.type === 'block' && selectedElement?.id === block.id 
          ? 'border-blue-400' 
          : ''
      }`}
      style={{
        padding: block.styling.padding,
        margin: block.styling.margin,
        backgroundColor: block.styling.backgroundColor
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelectElement({ type: 'block', id: block.id })
      }}
    >
      {renderBlockContent()}

      {/* Block Controls */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(rowId, columnId, block.id)
        }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
      >
        ×
      </button>
    </div>
  )
}
