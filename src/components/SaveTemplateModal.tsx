'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface SaveTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  templateName: string
  onRefresh?: () => void
}

export default function SaveTemplateModal({ 
  isOpen, 
  onClose, 
  templateName,
  onRefresh 
}: SaveTemplateModalProps) {
  const [saveStage, setSaveStage] = useState<'saving' | 'success' | 'complete'>('saving')
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (!isOpen) {
      setSaveStage('saving')
      setCountdown(3)
      return
    }

    // Simulate save process
    const saveTimer = setTimeout(() => {
      setSaveStage('success')
    }, 1000)

    const completeTimer = setTimeout(() => {
      setSaveStage('complete')
      
      // Start countdown
      let count = 3
      const countdownInterval = setInterval(() => {
        count--
        setCountdown(count)
        
        if (count <= 0) {
          clearInterval(countdownInterval)
          // Refresh page or trigger refresh
          if (onRefresh) {
            onRefresh()
          } else {
            window.location.reload()
          }
          onClose()
        }
      }, 1000)

      return () => clearInterval(countdownInterval)
    }, 2000)

    return () => {
      clearTimeout(saveTimer)
      clearTimeout(completeTimer)
    }
  }, [isOpen, onClose, onRefresh])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header with Spy-Tech Styling */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-cyan-500/30 p-6 text-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-2 right-2 w-4 h-4 border border-cyan-400/50 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border border-cyan-400/30 rounded animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute top-1/2 right-4 w-0.5 h-6 bg-gradient-to-b from-cyan-400/40 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className="relative z-10"
                >
                  {saveStage === 'saving' && (
                    <div className="text-cyan-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 mx-auto mb-4"
                      >
                        <ClockIcon className="w-12 h-12 text-cyan-400" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-white mb-2">🎯 SAVING TEMPLATE</h2>
                      <p className="text-cyan-300">Encrypting and storing...</p>
                    </div>
                  )}

                  {saveStage === 'success' && (
                    <div className="text-green-400">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6 }}
                        className="w-12 h-12 mx-auto mb-4"
                      >
                        <CheckCircleIcon className="w-12 h-12 text-green-400" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-white mb-2">✅ SAVE COMPLETE</h2>
                      <p className="text-green-300">Template secured successfully</p>
                    </div>
                  )}

                  {saveStage === 'complete' && (
                    <div className="text-amber-400">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                        className="w-12 h-12 mx-auto mb-4"
                      >
                        <SparklesIcon className="w-12 h-12 text-amber-400" />
                      </motion.div>
                      <h2 className="text-xl font-bold text-white mb-2">🚀 MISSION ACCOMPLISHED</h2>
                      <p className="text-amber-300">Refreshing interface...</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 text-center">
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-2">Template Updated</h3>
                    <p className="text-gray-300 text-sm break-words">
                      "{templateName}" has been saved with your latest changes
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-center space-x-4">
                    <div className={`flex items-center gap-2 ${
                      saveStage === 'saving' ? 'text-cyan-400' : 'text-green-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        saveStage === 'saving' ? 'bg-cyan-400 animate-pulse' : 'bg-green-400'
                      }`}></div>
                      <span className="text-xs font-medium">SAVE</span>
                    </div>

                    <div className="w-8 h-0.5 bg-gray-600">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                        initial={{ width: '0%' }}
                        animate={{ 
                          width: saveStage === 'saving' ? '50%' : saveStage === 'success' ? '100%' : '100%'
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    <div className={`flex items-center gap-2 ${
                      saveStage === 'complete' ? 'text-amber-400' : 
                      saveStage === 'success' ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        saveStage === 'complete' ? 'bg-amber-400 animate-pulse' :
                        saveStage === 'success' ? 'bg-green-400' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-xs font-medium">REFRESH</span>
                    </div>
                  </div>

                  {/* Countdown */}
                  {saveStage === 'complete' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                    >
                      <p className="text-amber-400 text-sm font-medium">
                        Auto-refreshing in {countdown} seconds...
                      </p>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                        <motion.div
                          className="bg-gradient-to-r from-amber-400 to-orange-400 h-1 rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 3, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Success Stats */}
                  {saveStage === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-3 gap-3 text-center"
                    >
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="text-green-400 font-bold text-lg">✅</div>
                        <div className="text-xs text-gray-400">Saved</div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="text-blue-400 font-bold text-lg">🔒</div>
                        <div className="text-xs text-gray-400">Encrypted</div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="text-purple-400 font-bold text-lg">⚡</div>
                        <div className="text-xs text-gray-400">Deployed</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-800/30 p-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                  {saveStage === 'saving' && 'Processing template data...'}
                  {saveStage === 'success' && 'Template ready for use'}
                  {saveStage === 'complete' && 'Preparing updated interface...'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
