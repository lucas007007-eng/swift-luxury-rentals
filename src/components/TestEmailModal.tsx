'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  EnvelopeIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { EmailTemplateConfig } from '@/types/email-templates'

interface TestEmailModalProps {
  isOpen: boolean
  onClose: () => void
  template: EmailTemplateConfig
}

interface TestResult {
  success: boolean
  message: string
  emailId?: string
  testType: string
  sentAt: string
  deliverabilityTips: string[]
}

export default function TestEmailModal({ isOpen, onClose, template }: TestEmailModalProps) {
  const [testEmail, setTestEmail] = useState('')
  const [testType, setTestType] = useState<'design' | 'deliverability' | 'spam'>('design')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testTypes = [
    {
      id: 'design',
      label: 'Design Test',
      description: 'Test visual layout and design elements',
      icon: EyeIcon,
      color: 'blue',
      tips: 'Perfect for checking how your email looks across different clients'
    },
    {
      id: 'deliverability',
      label: 'Deliverability Test',
      description: 'Test inbox placement and delivery',
      icon: EnvelopeIcon,
      color: 'green',
      tips: 'Ensures your email reaches the primary inbox, not spam'
    },
    {
      id: 'spam',
      label: 'Spam Filter Test',
      description: 'Test against spam filter algorithms',
      icon: ShieldCheckIcon,
      color: 'red',
      tips: 'Identifies potential spam triggers in your content'
    }
  ]

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setError('Please enter a test email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(testEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)
    setTestResult(null)

    try {
      const response = await fetch('/api/emails/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          testEmail,
          testType,
          testData: {
            // You can customize test data here
            customerName: 'Test Customer',
            customerEmail: testEmail
          }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResult({
          success: true,
          message: result.message,
          emailId: result.emailId,
          testType: result.testType,
          sentAt: result.sentAt,
          deliverabilityTips: result.deliverabilityTips || []
        })
      } else {
        setError(result.error || 'Failed to send test email')
      }
    } catch (err) {
      console.error('Test email error:', err)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTestType = testTypes.find(t => t.id === testType)
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      red: 'border-red-200 bg-red-50 text-red-700'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    📧 Test Email
                  </h2>
                  <p className="text-gray-600 mt-1">Send a test email for "{template.name}"</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter email address to send test"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Test Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Test Type
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {testTypes.map((type) => {
                      const Icon = type.icon
                      const isSelected = testType === type.id
                      return (
                        <div
                          key={type.id}
                          onClick={() => setTestType(type.id as any)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? getColorClasses(type.color) 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`w-6 h-6 mt-0.5 ${
                              isSelected ? '' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`font-semibold ${
                                  isSelected ? '' : 'text-gray-900'
                                }`}>
                                  {type.label}
                                </h3>
                                {isSelected && (
                                  <CheckCircleIcon className="w-5 h-5 text-current" />
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${
                                isSelected ? '' : 'text-gray-600'
                              }`}>
                                {type.description}
                              </p>
                              <p className={`text-xs mt-2 ${
                                isSelected ? 'opacity-90' : 'text-gray-500'
                              }`}>
                                💡 {type.tips}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Test Result */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">Test Email Sent!</h3>
                        <p className="text-sm text-green-700">{testResult.message}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Email ID:</span>
                          <span className="ml-2 font-mono text-gray-900">
                            {testResult.emailId?.substring(0, 8)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sent at:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(testResult.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {testResult.deliverabilityTips.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-900 mb-2">
                          💡 {selectedTestType?.label} Tips:
                        </h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          {testResult.deliverabilityTips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Template Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Template Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-medium">{template.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{template.category}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={isLoading || !testEmail.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <>
                      <ClockIcon className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-4 h-4" />
                      Send Test Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
