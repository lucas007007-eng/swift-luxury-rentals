'use client'

import React from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MvpAccomplishments from '@/components/MvpAccomplishments'

export default function DevOpsPage() {
  const devTools = [
    {
      title: 'Page Edits',
      description: 'Edit page content, SEO metadata, and site copy for all pages.',
      href: '/admin/pages',
      icon: '📝',
      color: 'green'
    },
    {
      title: 'Operating Manual', 
      description: 'Comprehensive operational procedures and best practices.',
      href: '/admin/operating-manual',
      icon: '📋',
      color: 'blue'
    },
    {
      title: 'Engineering Playbooks',
      description: 'Technical documentation and development workflows.',
      href: '/admin/playbooks', 
      icon: '⚙️',
      color: 'purple'
    },
    {
      title: 'Saved Prompts',
      description: 'AI prompts and templates for development tasks.',
      href: '/admin/prompts',
      icon: '🤖', 
      color: 'amber'
    },
    {
      title: 'Repo Map',
      description: 'Codebase structure and architecture overview.',
      href: '/admin/repo-map',
      icon: '🗺️',
      color: 'emerald'
    },
    {
      title: 'Week Plan',
      description: 'Development roadmap and sprint planning.',
      href: '/admin/week-plan',
      icon: '📅',
      color: 'indigo'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'border-green-400/30 bg-gradient-to-br from-[#0b1a0b] to-[#08120a] shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]',
      blue: 'border-blue-400/30 bg-gradient-to-br from-[#0b0f1a] to-[#080a12] shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
      purple: 'border-purple-400/30 bg-gradient-to-br from-[#1a0b1a] to-[#120a12] shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
      amber: 'border-amber-400/30 bg-gradient-to-br from-[#1a0f0b] to-[#120a08] shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      emerald: 'border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      indigo: 'border-indigo-400/30 bg-gradient-to-br from-[#0b0f1a] to-[#080a12] shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]'
    }
    return colors[color as keyof typeof colors] || colors.amber
  }

  const getTextColor = (color: string) => {
    const colors = {
      green: 'text-green-400',
      blue: 'text-blue-400', 
      purple: 'text-purple-400',
      amber: 'text-amber-400',
      emerald: 'text-emerald-400',
      indigo: 'text-indigo-400'
    }
    return colors[color as keyof typeof colors] || 'text-amber-400'
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header forceBackground={true} />
      <div className="flex-1 flex items-center justify-center pt-28 pb-20">
        <div className="max-w-[1800px] mx-auto px-6 py-10 w-full">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">DevOps Tools</h1>
            <p className="text-white/70 text-lg">Development operations and productivity tools</p>
            <Link href="/admin" className="inline-block mt-4 text-amber-400 hover:text-amber-300 transition-colors">← Back to Admin</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {devTools.map((tool) => (
              <Link 
                key={tool.title}
                href={tool.href}
                className={`relative rounded-2xl p-8 ${getColorClasses(tool.color)} cursor-pointer overflow-hidden group transition-all duration-300 min-h-[200px] flex flex-col justify-center`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-25 agent-grid" />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-4">{tool.icon}</div>
                  <div className={`font-mono uppercase tracking-wider text-sm ${getTextColor(tool.color)} mb-2`}>Development</div>
                  <div className="text-2xl font-extrabold text-white mb-4">{tool.title}</div>
                  <div className="text-white/70 text-sm mb-6 leading-relaxed">{tool.description}</div>
                  <div className={`inline-flex items-center px-4 py-2 rounded bg-${tool.color}-500 text-white font-semibold text-sm group-hover:bg-${tool.color}-400 transition-colors`}>
                    Open {tool.title} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Accomplishments Section */}
          <div className="mt-16 max-w-7xl mx-auto">
            <MvpAccomplishments />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
