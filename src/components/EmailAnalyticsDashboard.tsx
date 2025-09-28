'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  EnvelopeIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface EmailAnalyticsData {
  templateId: string
  templateName: string
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  complaints: number
  unsubscribed: number
  lastSent: string
  averageOpenRate: number
  averageClickRate: number
  deliveryRate: number
  recentTests: Array<{
    id: string
    type: 'design' | 'deliverability' | 'spam'
    recipient: string
    status: 'sent' | 'delivered' | 'bounced' | 'failed'
    sentAt: string
  }>
}

interface EmailAnalyticsDashboardProps {
  templateId?: string
}

export default function EmailAnalyticsDashboard({ templateId }: EmailAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<EmailAnalyticsData[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [loading, setLoading] = useState(true)

  // Mock analytics data (in real app, this would come from your database + Resend webhooks)
  const mockAnalyticsData: EmailAnalyticsData[] = [
    {
      templateId: 'welcome-vip',
      templateName: '🎯 VIP Welcome Series',
      totalSent: 127,
      delivered: 125,
      opened: 89,
      clicked: 34,
      bounced: 2,
      complaints: 0,
      unsubscribed: 1,
      lastSent: '2025-01-15T10:30:00Z',
      averageOpenRate: 71.2,
      averageClickRate: 27.0,
      deliveryRate: 98.4,
      recentTests: [
        {
          id: 'test-1',
          type: 'design',
          recipient: 'test@phantomproperties.co',
          status: 'delivered',
          sentAt: '2025-01-15T09:15:00Z'
        },
        {
          id: 'test-2',
          type: 'deliverability',
          recipient: 'admin@phantomproperties.co',
          status: 'delivered',
          sentAt: '2025-01-14T16:22:00Z'
        }
      ]
    },
    {
      templateId: 'booking-confirmed-luxury',
      templateName: '✅ Luxury Booking Confirmation',
      totalSent: 89,
      delivered: 89,
      opened: 76,
      clicked: 42,
      bounced: 0,
      complaints: 0,
      unsubscribed: 0,
      lastSent: '2025-01-15T14:45:00Z',
      averageOpenRate: 85.4,
      averageClickRate: 47.2,
      deliveryRate: 100.0,
      recentTests: [
        {
          id: 'test-3',
          type: 'design',
          recipient: 'manager@phantomproperties.co',
          status: 'delivered',
          sentAt: '2025-01-15T11:30:00Z'
        }
      ]
    },
    {
      templateId: 'payment-reminder-urgent',
      templateName: '🚨 Payment Reminder - Urgent',
      totalSent: 45,
      delivered: 43,
      opened: 38,
      clicked: 31,
      bounced: 2,
      complaints: 0,
      unsubscribed: 0,
      lastSent: '2025-01-15T08:00:00Z',
      averageOpenRate: 84.4,
      averageClickRate: 68.9,
      deliveryRate: 95.6,
      recentTests: []
    }
  ]

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData)
      setLoading(false)
    }, 1000)
  }, [selectedTimeframe])

  const totalMetrics = analyticsData.reduce((acc, template) => ({
    totalSent: acc.totalSent + template.totalSent,
    delivered: acc.delivered + template.delivered,
    opened: acc.opened + template.opened,
    clicked: acc.clicked + template.clicked,
    bounced: acc.bounced + template.bounced
  }), { totalSent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 })

  const overallOpenRate = totalMetrics.totalSent > 0 ? (totalMetrics.opened / totalMetrics.totalSent * 100) : 0
  const overallClickRate = totalMetrics.totalSent > 0 ? (totalMetrics.clicked / totalMetrics.totalSent * 100) : 0
  const overallDeliveryRate = totalMetrics.totalSent > 0 ? (totalMetrics.delivered / totalMetrics.totalSent * 100) : 0

  if (loading) {
    return (
      <div className="animate-pulse p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">📊 Email Analytics</h2>
          <p className="text-gray-400 mt-1">Klaviyo-style performance metrics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 text-white px-3 py-2 rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-800/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <EnvelopeIcon className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{totalMetrics.totalSent}</span>
          </div>
          <h3 className="text-sm font-medium text-blue-400">Total Emails Sent</h3>
          <p className="text-xs text-gray-400 mt-1">Across all templates</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-900/20 to-black border border-green-800/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <CheckCircleIcon className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{overallDeliveryRate.toFixed(1)}%</span>
          </div>
          <h3 className="text-sm font-medium text-green-400">Delivery Rate</h3>
          <p className="text-xs text-gray-400 mt-1">{totalMetrics.delivered} of {totalMetrics.totalSent} delivered</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-800/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <EyeIcon className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">{overallOpenRate.toFixed(1)}%</span>
          </div>
          <h3 className="text-sm font-medium text-purple-400">Open Rate</h3>
          <p className="text-xs text-gray-400 mt-1">{totalMetrics.opened} opens</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-900/20 to-black border border-amber-800/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <CursorArrowRaysIcon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-bold text-white">{overallClickRate.toFixed(1)}%</span>
          </div>
          <h3 className="text-sm font-medium text-amber-400">Click Rate</h3>
          <p className="text-xs text-gray-400 mt-1">{totalMetrics.clicked} clicks</p>
        </motion.div>
      </div>

      {/* Template Performance Table */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Template Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Template
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Sent
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Delivery Rate
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Last Sent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {analyticsData.map((template) => (
                <tr key={template.templateId} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {template.templateName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {template.recentTests.length} recent tests
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-white">
                    {template.totalSent}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      template.averageOpenRate >= 60 ? 'text-green-400' :
                      template.averageOpenRate >= 30 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {template.averageOpenRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      template.averageClickRate >= 20 ? 'text-green-400' :
                      template.averageClickRate >= 10 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {template.averageClickRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      template.deliveryRate >= 95 ? 'text-green-400' :
                      template.deliveryRate >= 90 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {template.deliveryRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    {new Date(template.lastSent).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Test Results */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Recent Test Emails</h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {analyticsData.flatMap(template => 
              template.recentTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      test.status === 'delivered' ? 'bg-green-500' :
                      test.status === 'sent' ? 'bg-blue-500' :
                      test.status === 'bounced' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {test.type.charAt(0).toUpperCase() + test.type.slice(1)} Test
                      </p>
                      <p className="text-xs text-gray-400">
                        {template.templateName} → {test.recipient}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      test.status === 'delivered' ? 'text-green-400' :
                      test.status === 'sent' ? 'text-blue-400' :
                      test.status === 'bounced' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {test.status.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(test.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Klaviyo-style Insights */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🤖 AI Insights (Klaviyo-style)</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-400">High Performance Template</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Your "Luxury Booking Confirmation" template has a 85.4% open rate, which is 23% above industry average.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-400">Optimization Opportunity</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Consider A/B testing subject lines for your payment reminders to improve open rates.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <FunnelIcon className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-400">Segmentation Suggestion</h4>
                <p className="text-sm text-gray-300 mt-1">
                  VIP customers show 34% higher engagement. Consider creating VIP-specific templates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Benchmarks (Klaviyo-style) */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">📈 Industry Benchmarks</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400 mb-1">
              {overallOpenRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400">Your Open Rate</p>
            <p className="text-xs text-green-400 mt-1">
              +12% vs. Industry (58.7%)
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {overallClickRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400">Your Click Rate</p>
            <p className="text-xs text-green-400 mt-1">
              +8% vs. Industry (15.1%)
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {overallDeliveryRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400">Delivery Rate</p>
            <p className="text-xs text-green-400 mt-1">
              +2% vs. Industry (96.2%)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
