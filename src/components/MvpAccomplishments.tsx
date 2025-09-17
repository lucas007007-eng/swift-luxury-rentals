"use client"

import React from 'react'

// Get unique icon for each achievement based on task content
const getAchievementIcon = (task: string): JSX.Element => {
  const t = task.toLowerCase()
  
  // Frontend icons
  if (t.includes('homepage')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  if (t.includes('city pages') || t.includes('property pages')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M9 11H7l5-4.5L17 11h-2v7h-6v-7z"/></svg>
  if (t.includes('concierge') || t.includes('about') || t.includes('contact')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
  if (t.includes('filter modal') || t.includes('airbnb-style')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
  if (t.includes('amenity chips') || t.includes('categorized')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-8 8z"/></svg>
  if (t.includes('search interface')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
  if (t.includes('date‑range') || t.includes('calendar')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
  if (t.includes('image gallery') || t.includes('modal viewer')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
  if (t.includes('navigation') || t.includes('rsc‑safe')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  if (t.includes('performance') || t.includes('dynamic imports')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M13,2.05C13.65,2.05 14.19,2.59 14.19,3.24V7.81C14.19,8.46 13.65,9 13,9H11C10.35,9 9.81,8.46 9.81,7.81V3.24C9.81,2.59 10.35,2.05 11,2.05H13M13,10C13.65,10 14.19,10.54 14.19,11.19V20.76C14.19,21.41 13.65,21.95 13,21.95H11C10.35,21.95 9.81,21.41 9.81,20.76V11.19C9.81,10.54 10.35,10 11,10H13Z"/></svg>
  if (t.includes('service worker') || t.includes('offline')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3C7.58,3 4,6.58 4,11C4,15.42 7.58,19 12,19C16.42,19 20,15.42 20,11C20,6.58 16.42,3 12,3M12,17C8.69,17 6,14.31 6,11C6,7.69 8.69,5 12,5C15.31,5 18,7.69 18,11C18,14.31 15.31,17 12,17M12,7A4,4 0 0,0 8,11A4,4 0 0,0 12,15A4,4 0 0,0 16,11A4,4 0 0,0 12,7Z"/></svg>
  
  // Admin icons
  if (t.includes('spy‑theme') || t.includes('styling')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21A7,7 0 0,1 14,26H10A7,7 0 0,1 3,19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M12,4A0,0 0 0,0 12,4A0,0 0 0,0 12,4M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/></svg>
  if (t.includes('auth') || t.includes('login') || t.includes('security')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.3C16,16.9 15.4,17.5 14.8,17.5H9.2C8.6,17.5 8,16.9 8,16.3V12.7C8,12.1 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/></svg>
  if (t.includes('booking') || t.includes('reservation')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
  if (t.includes('payment') || t.includes('deposit') || t.includes('crm')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8,10.9C9.53,10.31 8.8,9.7 8.8,8.75C8.8,7.66 9.81,6.9 11.5,6.9C13.28,6.9 13.94,7.75 14,9H16.21C16.14,7.28 15.09,5.7 13,5.19V3H10V5.16C8.06,5.58 6.5,6.84 6.5,8.77C6.5,11.08 8.41,12.23 11.2,12.9C13.7,13.5 14.2,14.38 14.2,15.31C14.2,16 13.71,17.1 11.5,17.1C9.44,17.1 8.63,16.18 8.5,15H6.32C6.44,17.19 8.08,18.42 10,18.83V21H13V18.85C14.95,18.5 16.5,17.35 16.5,15.3C16.5,12.46 14.07,11.5 11.8,10.9Z"/></svg>
  if (t.includes('database') || t.includes('prisma') || t.includes('schema')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"/></svg>
  if (t.includes('deploy') || t.includes('server') || t.includes('environment')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H4C5.11,11 6,10.11 6,9V3C6,1.89 5.11,1 4,1M4,3H4V7H4V3M9,3V5H12V3H9M15,3V5H18V3H15M9,6V8H12V6H9M15,6V8H18V6H15M4,12C2.89,12 2,12.89 2,14V18C2,19.11 2.89,20 4,20H1V22H4C5.11,22 6,21.11 6,20V14C6,12.89 5.11,12 4,12M4,14H4V18H4V14M9,14V16H12V14H9M15,14V16H18V14H15M9,17V19H12V17H9M15,17V19H18V17H15Z"/></svg>
  if (t.includes('timer') || t.includes('time')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z"/></svg>
  if (t.includes('backup') || t.includes('restore')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,3A9,9 0 0,0 3,12H0L4,16L8,12H5A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19C10.5,19 9.09,18.5 7.94,17.7L6.5,19.14C8.04,20.3 9.94,21 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z"/></svg>
  if (t.includes('mobile') || t.includes('responsive')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21A2,2 0 0,0 7,23H17A2,2 0 0,0 19,21V3C19,1.89 18.1,1 17,1Z"/></svg>
  if (t.includes('analytics') || t.includes('metrics') || t.includes('profitable')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21Z"/></svg>
  if (t.includes('health') || t.includes('monitor')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,9H13V7H11V9M11,17H13V11H11V17Z"/></svg>
  if (t.includes('production') || t.includes('build')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/></svg>
  if (t.includes('table') || t.includes('ui') || t.includes('layout')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/></svg>
  if (t.includes('media') || t.includes('image') || t.includes('photo')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/></svg>
  if (t.includes('pricing') || t.includes('price')) return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/></svg>
  
  // Default fallback
  return <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}

// Calculate XP rewards based on task complexity and time investment
const getXPReward = (task: string): string => {
  const t = task.toLowerCase()
  
  // 500 XP - Most complex, multi-week features
  if (t.includes('homepage') && t.includes('server component') && t.includes('optimized hero video')) return '+500 XP'
  if (t.includes('airbnb-style filter modal') && t.includes('beds, baths, amenities')) return '+500 XP'
  if (t.includes('service worker') && t.includes('offline caching')) return '+500 XP'
  if (t.includes('admin login api') && t.includes('middleware guard')) return '+500 XP'
  if (t.includes('safer recompute totals') && t.includes('server-only, idempotent')) return '+500 XP'
  if (t.includes('development timer: database') && t.includes('real-time persistence')) return '+500 XP'
  if (t.includes('start‑server.bat') && t.includes('env bootstrap') && t.includes('prisma')) return '+500 XP'
  if (t.includes('luxury dark theme payment') && t.includes('pay monthly vs pay full')) return '+500 XP'
  if (t.includes('professional dashboard with tab') && t.includes('bookings, lease applications')) return '+500 XP'
  
  // 400 XP - Complex multi-day features
  if (t.includes('city pages') && t.includes('property pages')) return '+400 XP'
  if (t.includes('categorized amenity chips') && t.includes('popular, essentials')) return '+400 XP'
  if (t.includes('search interface') && t.includes('destination, service, date range')) return '+400 XP'
  if (t.includes('image gallery') && t.includes('modal viewer')) return '+400 XP'
  if (t.includes('rsc‑safe navigation') && t.includes('buttons → link')) return '+400 XP'
  if (t.includes('dynamic imports') && t.includes('reduce initial js')) return '+400 XP'
  if (t.includes('rate limiting') && t.includes('max 5 attempts')) return '+400 XP'
  if (t.includes('deposit lifecycle') && t.includes('held → received → refunded')) return '+400 XP'
  if (t.includes('crm dashboard') && t.includes('table + mobile cards')) return '+400 XP'
  if (t.includes('responsive table') && t.includes('proportional column widths')) return '+400 XP'
  if (t.includes('prisma schema, migrations')) return '+400 XP'
  if (t.includes('performance indexes') && t.includes('booking, payment')) return '+400 XP'
  if (t.includes('timer persistence perfected') && t.includes('beforeunload')) return '+400 XP'
  if (t.includes('smart booking categorization') && t.includes('payment management')) return '+400 XP'
  if (t.includes('user dashboard with airbnb-style') && t.includes('booking display')) return '+400 XP'
  
  // 300 XP - Moderate complexity, 1-2 day features
  if (t.includes('filter button aligned') && t.includes('fully mobile-friendly')) return '+300 XP'
  if (t.includes('dynamic results count') && t.includes('real-time updates')) return '+300 XP'
  if (t.includes('public date‑range pickers')) return '+300 XP'
  if (t.includes('duration labels') && t.includes('booking logic')) return '+300 XP'
  if (t.includes('availability display') && t.includes('booking logic')) return '+300 XP'
  if (t.includes('remote image domains') && t.includes('next image')) return '+300 XP'
  if (t.includes('spy‑theme styling')) return '+300 XP'
  if (t.includes('mobile‑first cards/grids')) return '+300 XP'
  if (t.includes('map interaction polish')) return '+300 XP'
  if (t.includes('immediate navigation') && t.includes('auth is recognized')) return '+300 XP'
  if (t.includes('secure cookies') && t.includes('httponly, secure')) return '+300 XP'
  if (t.includes('tools: create booking, delete')) return '+300 XP'
  if (t.includes('scoreboard pills') && t.includes('accurate global counts')) return '+300 XP'
  if (t.includes('pagination, preserved filters')) return '+300 XP'
  if (t.includes('most profitable cities') && t.includes('sales metrics')) return '+300 XP'
  if (t.includes('mvp progress tracker') && t.includes('persisted with versioning')) return '+300 XP'
  if (t.includes('edit details: title, description')) return '+300 XP'
  if (t.includes('pricing controls') && t.includes('scheduled charge preview')) return '+300 XP'
  if (t.includes('media management') && t.includes('gallery ordering')) return '+300 XP'
  if (t.includes('adminoverride model') && t.includes('json fallback')) return '+300 XP'
  if (t.includes('data model hardening') && t.includes('validation')) return '+300 XP'
  if (t.includes('backup/restore') && t.includes('zip snapshots')) return '+300 XP'
  if (t.includes('production deployment') && t.includes('build completes')) return '+300 XP'
  if (t.includes('timer performance optimized') && t.includes('eliminated database spam')) return '+300 XP'
  
  // 200 XP - Standard features, half-day to 1-day work
  if (t.includes('concierge, about, contact')) return '+200 XP'
  if (t.includes('master amenities') && t.includes('overrides + base')) return '+200 XP'
  if (t.includes('case-insensitive amenity') && t.includes('synonyms')) return '+200 XP'
  if (t.includes('expanded amenity categorization')) return '+200 XP'
  if (t.includes('search footer') && t.includes('accurate live results')) return '+200 XP'
  if (t.includes('environment-based credentials')) return '+200 XP'
  if (t.includes('logout functionality') && t.includes('dashboard button')) return '+200 XP'
  if (t.includes('status updates') && t.includes('hold/confirmed/cancelled')) return '+200 XP'
  if (t.includes('seed/backfill utilities')) return '+200 XP'
  if (t.includes('synthesize payments fixed') && t.includes('confirmed bookings')) return '+200 XP'
  if (t.includes('hold booking payment') && t.includes('cleanup endpoint')) return '+200 XP'
  if (t.includes('scheduled payments hidden') && t.includes('save button')) return '+200 XP'
  if (t.includes('refund button logic') && t.includes('deposit received')) return '+200 XP'
  if (t.includes('admin productivity toolkit')) return '+200 XP'
  if (t.includes('per‑property availability') && t.includes('month nav')) return '+200 XP'
  if (t.includes('quick test booking') && t.includes('admin test booking bar')) return '+200 XP'
  if (t.includes('scoreboard counts') && t.includes('direct db queries')) return '+200 XP'
  if (t.includes('start‑server‑desktop') && t.includes('project discovery')) return '+200 XP'
  if (t.includes('/api/health') && t.includes('db‑ping')) return '+200 XP'
  if (t.includes('env validator') && t.includes('database_url missing')) return '+200 XP'
  if (t.includes('docker‑compose.prod') && t.includes('scaffolding')) return '+200 XP'
  if (t.includes('production build blockers') && t.includes('usesearchparams')) return '+200 XP'
  if (t.includes('component expand/collapse') && t.includes('preventdefault')) return '+200 XP'
  if (t.includes('accomplishments ui improved') && t.includes('checkbox-style')) return '+200 XP'
  
  // 100 XP - Simple tasks, few hours work
  return '+100 XP'
}

export default function MvpAccomplishments() {
  const [open, setOpen] = React.useState(false)

  const frontend: { title: string; items: string[] }[] = [
    {
      title: 'Site structure and pages',
      items: [
        'Homepage (Server Component) with optimized hero video and dynamic imports',
        'City pages (/city/[cityName]) and Property pages (/property/[id])',
        'Concierge, About, Contact, Pricing, Corporate Rentals, List Your Property, Request, Login, Register, Privacy, Terms, Cookie Policy',
      ],
    },
    {
      title: 'City filters',
      items: [
        'Airbnb-style filter modal on city pages (beds, baths, amenities)',
        'Categorized amenity chips (Popular, Essentials, Features, Safety)',
        'Filter button aligned with search bar; fully mobile-friendly modal',
        'Dynamic results count in footer (real-time updates before apply)'
      ],
    },
    {
      title: 'Search & calendars',
      items: [
        'Search interface (destination, service, date range), responsive layout',
        'Public date‑range pickers (full and mini)',
        'Duration labels (1st/2nd month, day counts) linked to booking logic',
      ],
    },
    {
      title: 'Property detail UX',
      items: [
        'Image gallery with modal viewer',
        'Availability display aligned with booking logic',
      ],
    },
    {
      title: 'Performance & navigation',
      items: [
        'RSC‑safe navigation (buttons → Link)',
        'Dynamic imports to reduce initial JS; hero video preload=metadata',
        'Remote image domains configured in Next image settings',
        'Service Worker implementation with offline caching and fallback pages',
      ],
    },
    {
      title: 'User Experience & Payments',
      items: [
        'Luxury dark theme payment page with Pay Monthly vs Pay Full toggle',
        'Professional dashboard with tab navigation (Bookings, Lease Applications, Past)',
        'Smart booking categorization and payment management with 3-column layout',
        'User dashboard with Airbnb-style booking display and payment tracking',
      ],
    },
  ]

  const admin: { title: string; items: string[] }[] = [
    { title: 'Visuals & UX (admin only)', items: [
      'Spy‑theme styling across admin surfaces',
      'Mobile‑first cards/grids; consistent spacing & typography on metrics/payment sections',
      'Map interaction polish (smoother hover/zoom, debounced, cleanup)',
    ]},
    { title: 'Filters & amenities', items: [
      'Master amenities derived from berlin-real-1 (overrides + base)',
      'Case-insensitive amenity matching with synonyms for reliable filtering',
      'Public property page: expanded amenity categorization and rendering',
      'Search footer shows accurate live results count',
    ]},
    { title: 'Admin auth & routing', items: [
      'Admin login API sets admin_auth; middleware guard on /admin',
      'Immediate navigation on login so auth is recognized',
      'Environment-based credentials (ADMIN_USERNAME/ADMIN_PASSWORD)',
      'Rate limiting: max 5 attempts per IP per 15 minutes',
      'Secure cookies: httpOnly, secure in production, 24-hour expiry',
      'Logout functionality with /api/admin/logout endpoint and dashboard button',
    ]},
    { title: 'Bookings operations', items: [
      'Status updates (Hold/Confirmed/Cancelled) with Save',
      'Deposit lifecycle: Held → Received (green) → Refunded (blue, post‑checkout)',
      'Tools: create booking, delete, receive next/selected, refund deposit',
      'Seed/backfill utilities; Test Booking Bar calendar fixed (navigation layering)',
      'Safer recompute totals: server-only, idempotent, comprehensive logging, dry-run mode',
      'Synthesize payments fixed: only processes confirmed bookings, never marks holds as paid',
      'Hold booking payment corruption fixed: cleanup endpoint reverted incorrect received payments',
    ]},
    { title: 'Admin bookings UI', items: [
      'Scoreboard pills (Total/Hold/Confirmed/Cancelled) with accurate global counts and filtering',
      'Pagination, preserved filters, mobile card layout',
      'Scheduled payments hidden on Hold; Save button clipping fixed',
      'Responsive table: proportional column widths (10-18%), no cropping on any screen size',
      'Refund button logic fixed: appears correctly for deposits showing "Deposit Received"',
    ]},
    { title: 'CRM & analytics', items: [
      'CRM dashboard (table + mobile cards) linking to bookings/properties',
      'Most Profitable Cities tile; sales metrics (upcoming payments, overdue)',
      'MVP Progress tracker (persisted with versioning)',
      'Admin productivity toolkit pages (Operating Manual, Playbooks, Prompts, Repo Map, Week Plan)',
    ]},
    { title: 'Listings management (Admin)', items: [
      'Edit details: title, description, address, amenities',
      'Pricing controls: monthly rate, fees; scheduled charge preview',
      'Media management: add/remove photos, gallery ordering',
      'Per‑property availability calendar (month nav, availability set)',
      'Quick test booking creation via Admin Test Booking Bar',
    ]},
    { title: 'Data & ORM (Prisma)', items: [
      'Prisma schema, migrations, seeds; refined booking/payment models',
      'Scoreboard counts via direct DB queries (decoupled from filters)',
      'AdminOverride model added to DB with JSON fallback for backward compatibility',
      'Performance indexes added: Booking (status, checkin), Payment (bookingId, purpose, status, dueAt)',
      'Data model hardening: booking validation (dates, overlaps), soft delete with audit trail',
    ]},
    { title: 'One‑click environment & restore', items: [
      'start‑server.bat: env bootstrap, Prisma generate/migrate (db push fallback), safe seed, Docker Postgres, cache clean, port auto‑select, running‑server reuse, post‑launch health probe',
      'start‑server‑desktop.bat: project discovery + delegation',
      'Backup/restore: zip snapshots; restore skips startup scripts and heavy folders',
    ]},
    { title: 'Observability & prod readiness', items: [
      '/api/health DB‑ping endpoint',
      'Env validator (production fails fast if DATABASE_URL missing)',
      'docker‑compose.prod.yml and start‑prod.bat scaffolding',
      'Production build blockers fixed: dynamic force-dynamic for useSearchParams pages',
      'Production deployment fully working: build completes, server starts and responds',
      'Development Timer: database-backed with real-time persistence and live seconds tracking',
      'Timer persistence perfected: beforeunload auto-save with exact session continuity across refreshes',
      'Timer performance optimized: eliminated database spam, pure localStorage with exact seconds tracking',
      'Component expand/collapse independence fixed (preventDefault + stopPropagation)',
      'Accomplishments UI improved: full-width layout and checkbox-style readability',
    ]},
  ]

  // Compute balanced split for Admin sections
  const frontendWeight = frontend.reduce((sum, sec) => sum + 1 + sec.items.length, 0)
  const adminWeights = admin.map(sec => 1 + sec.items.length)
  const totalAdminWeight = adminWeights.reduce((a,b)=>a+b,0)
  let leftWeight = frontendWeight
  let rightWeight = totalAdminWeight
  const adminLeft: typeof admin = []
  const adminRight: typeof admin = []
  for (let i = 0; i < admin.length; i++) {
    const w = adminWeights[i]
    if (leftWeight < rightWeight) { adminLeft.push(admin[i]); leftWeight += w; rightWeight -= w } else { adminRight.push(admin[i]) }
  }
  if (adminRight.length === 0) { const moved = adminLeft.pop(); if (moved) adminRight.push(moved) }

  return (
    <div className="rounded-2xl p-6 border border-emerald-400/30 bg-gradient-to-br from-[#0b1a12] to-[#08120d] shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(v => !v)
        }}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono uppercase tracking-wider text-base md:text-lg gold-metallic-text">Accomplishments</div>
            <div className="text-white/80 text-sm">All completed MVP features (Frontend & Admin)</div>
          </div>
          <svg className={`w-5 h-5 text-white/70 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </button>
      {open && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column: Frontend + part of Admin */}
          <div className="space-y-4">
            <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
              <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Frontend (Public)</div>
              <div className="space-y-3">
                {frontend.map((sec) => (
                  <div key={sec.title}>
                    <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                    <div className="grid grid-cols-2 gap-3">
                      {sec.items.map((it, i) => {
                        const getAchievementTitle = (task: string) => {
                          const t = task.toLowerCase()
                          // Frontend achievements
                          if (t.includes('homepage') && t.includes('server component')) return 'HOMEPAGE COMMANDER'
                          if (t.includes('city pages') && t.includes('property pages')) return 'SITE ARCHITECT'
                          if (t.includes('concierge') && t.includes('about')) return 'PAGE MASTER'
                          if (t.includes('airbnb-style filter modal')) return 'FILTER SPECIALIST'
                          if (t.includes('categorized amenity chips')) return 'UX TACTICIAN'
                          if (t.includes('filter button aligned')) return 'MOBILE COMMANDER'
                          if (t.includes('dynamic results count')) return 'REAL-TIME GURU'
                          if (t.includes('search interface')) return 'SEARCH OPERATIVE'
                          if (t.includes('public date‑range pickers')) return 'CALENDAR EXPERT'
                          if (t.includes('duration labels')) return 'TIME SPECIALIST'
                          if (t.includes('image gallery')) return 'GALLERY MASTER'
                          if (t.includes('availability display')) return 'BOOKING WIZARD'
                          if (t.includes('rsc‑safe navigation')) return 'NAV ARCHITECT'
                          if (t.includes('dynamic imports')) return 'PERFORMANCE KING'
                          if (t.includes('remote image domains')) return 'IMAGE HANDLER'
                          if (t.includes('service worker')) return 'OFFLINE GUARDIAN'
                          if (t.includes('luxury dark theme payment')) return 'PAYMENT DESIGNER'
                          if (t.includes('professional dashboard with tab')) return 'DASHBOARD ARCHITECT'
                          if (t.includes('smart booking categorization')) return 'UX STRATEGIST'
                          if (t.includes('user dashboard with airbnb-style')) return 'CLIENT PORTAL MASTER'
                          return 'MISSION COMPLETE'
                        }
                        return (
                          <div key={i} className="group relative bg-gray-900/80 border border-gray-700 rounded-xl p-3 hover:border-amber-400/40 transition-all duration-200">
                            {/* Achievement Header */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                {getAchievementIcon(it)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-amber-300 font-bold text-xs truncate">{getAchievementTitle(it)}</div>
                                <div className="text-emerald-400 font-medium text-xs">{getXPReward(it)}</div>
                              </div>
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6L9 17l-5-5"/>
                                </svg>
                              </div>
                            </div>
                            
                            {/* Achievement Description */}
                            <div className="text-gray-300 text-xs leading-relaxed line-clamp-2">{it}</div>
                            
                            {/* Completion Status */}
                            <div className="mt-2 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                              <div className="text-emerald-400 font-medium text-xs text-center">COMPLETED</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {adminLeft.length > 0 && (
              <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
                <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Admin / Backend</div>
                <div className="space-y-3">
                  {adminLeft.map((sec) => (
                    <div key={sec.title}>
                      <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                      <div className="grid grid-cols-2 gap-3">
                        {sec.items.map((it, i) => {
                          const getAchievementTitle = (task: string) => {
                            const t = task.toLowerCase()
                            // Admin achievements with unique names
                            if (t.includes('spy‑theme styling')) return 'STEALTH DESIGNER'
                            if (t.includes('mobile‑first cards')) return 'MOBILE TACTICIAN'
                            if (t.includes('map interaction polish')) return 'MAP SPECIALIST'
                            if (t.includes('master amenities')) return 'AMENITY OVERLORD'
                            if (t.includes('case-insensitive amenity')) return 'SEARCH ENGINEER'
                            if (t.includes('expanded amenity categorization')) return 'CATEGORY CHIEF'
                            if (t.includes('search footer')) return 'RESULTS MASTER'
                            if (t.includes('admin login api')) return 'AUTH COMMANDER'
                            if (t.includes('immediate navigation')) return 'LOGIN SPECIALIST'
                            if (t.includes('environment-based credentials')) return 'CONFIG GUARDIAN'
                            if (t.includes('rate limiting')) return 'SECURITY SENTINEL'
                            if (t.includes('secure cookies')) return 'COOKIE DEFENDER'
                            if (t.includes('logout functionality')) return 'SESSION TERMINATOR'
                            if (t.includes('status updates')) return 'STATUS CONTROLLER'
                            if (t.includes('deposit lifecycle')) return 'PAYMENT OVERLORD'
                            if (t.includes('tools: create booking')) return 'BOOKING ARCHITECT'
                            if (t.includes('seed/backfill utilities')) return 'DATA SEEDER'
                            if (t.includes('safer recompute totals')) return 'CALC GUARDIAN'
                            if (t.includes('synthesize payments fixed')) return 'PAYMENT FIXER'
                            if (t.includes('hold booking payment')) return 'CORRUPTION HUNTER'
                            if (t.includes('scoreboard pills')) return 'METRICS COMMANDER'
                            if (t.includes('pagination, preserved filters')) return 'UI STRATEGIST'
                            if (t.includes('scheduled payments hidden')) return 'DISPLAY OPTIMIZER'
                            if (t.includes('responsive table')) return 'TABLE MASTER'
                            if (t.includes('refund button logic')) return 'REFUND SPECIALIST'
                            if (t.includes('crm dashboard')) return 'CRM OVERLORD'
                            if (t.includes('most profitable cities')) return 'PROFIT TRACKER'
                            if (t.includes('mvp progress tracker')) return 'PROGRESS KING'
                            if (t.includes('admin productivity toolkit')) return 'TOOL COMMANDER'
                            if (t.includes('edit details: title')) return 'LISTING EDITOR'
                            if (t.includes('pricing controls')) return 'PRICE STRATEGIST'
                            if (t.includes('media management')) return 'MEDIA OVERLORD'
                            if (t.includes('per‑property availability')) return 'CALENDAR CHIEF'
                            if (t.includes('quick test booking')) return 'TEST SPECIALIST'
                            if (t.includes('prisma schema')) return 'SCHEMA ARCHITECT'
                            if (t.includes('scoreboard counts')) return 'QUERY MASTER'
                            if (t.includes('adminoverride model')) return 'OVERRIDE GUARDIAN'
                            if (t.includes('performance indexes')) return 'INDEX COMMANDER'
                            if (t.includes('data model hardening')) return 'VALIDATION CHIEF'
                            if (t.includes('start‑server.bat')) return 'DEPLOY COMMANDER'
                            if (t.includes('start‑server‑desktop')) return 'DESKTOP SPECIALIST'
                            if (t.includes('backup/restore')) return 'BACKUP GUARDIAN'
                            if (t.includes('/api/health')) return 'HEALTH MONITOR'
                            if (t.includes('env validator')) return 'CONFIG VALIDATOR'
                            if (t.includes('docker‑compose.prod')) return 'PROD ARCHITECT'
                            if (t.includes('production build blockers')) return 'BUILD FIXER'
                            if (t.includes('production deployment')) return 'DEPLOY MASTER'
                            if (t.includes('development timer: database')) return 'TIME OVERLORD'
                            if (t.includes('timer persistence perfected')) return 'PERSISTENCE KING'
                            if (t.includes('timer performance optimized')) return 'OPTIMIZATION GURU'
                            if (t.includes('component expand/collapse')) return 'EVENT SPECIALIST'
                            if (t.includes('accomplishments ui improved')) return 'UI PERFECTIONIST'
                            return 'ELITE OPERATIVE'
                          }
                          return (
                            <div key={i} className="group relative bg-gray-900/80 border border-gray-700 rounded-lg p-2 hover:border-amber-400/40 transition-all duration-200">
                              {/* Compact Header */}
                              <div className="flex items-center gap-1 mb-2">
                                <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                                  {getAchievementIcon(it)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-amber-300 font-bold text-xs truncate">{getAchievementTitle(it)}</div>
                                </div>
                                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                </div>
                              </div>
                              
                              {/* XP Badge */}
                              <div className="mb-2">
                                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{getXPReward(it)}</span>
                              </div>
                              
                              {/* Compact Description */}
                              <div className="text-gray-400 text-xs leading-tight line-clamp-2 mb-2">{it}</div>
                              
                              {/* Status */}
                              <div className="text-emerald-400 font-medium text-xs text-center">COMPLETED</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Right column: remaining Admin */}
          <div className="rounded-xl p-4 border border-emerald-400/20 bg-gradient-to-br from-[#0b1a12] to-[#08120d]">
            <div className="font-mono uppercase tracking-wider text-base text-emerald-400 mb-3 font-bold">Admin / Backend</div>
            <div className="space-y-3">
              {(adminRight.length ? adminRight : admin).map((sec) => (
                <div key={sec.title}>
                  <div className="text-emerald-300 font-semibold text-sm mb-2">{sec.title}</div>
                  <div className="grid grid-cols-2 gap-3">
                    {sec.items.map((it, i) => {
                      const getAchievementTitle = (task: string) => {
                        const t = task.toLowerCase()
                        // Admin achievements with unique names
                        if (t.includes('spy‑theme styling')) return 'STEALTH DESIGNER'
                        if (t.includes('mobile‑first cards')) return 'MOBILE TACTICIAN'
                        if (t.includes('map interaction polish')) return 'MAP SPECIALIST'
                        if (t.includes('master amenities')) return 'AMENITY OVERLORD'
                        if (t.includes('case-insensitive amenity')) return 'SEARCH ENGINEER'
                        if (t.includes('expanded amenity categorization')) return 'CATEGORY CHIEF'
                        if (t.includes('search footer')) return 'RESULTS MASTER'
                        if (t.includes('admin login api')) return 'AUTH COMMANDER'
                        if (t.includes('immediate navigation')) return 'LOGIN SPECIALIST'
                        if (t.includes('environment-based credentials')) return 'CONFIG GUARDIAN'
                        if (t.includes('rate limiting')) return 'SECURITY SENTINEL'
                        if (t.includes('secure cookies')) return 'COOKIE DEFENDER'
                        if (t.includes('logout functionality')) return 'SESSION TERMINATOR'
                        if (t.includes('status updates')) return 'STATUS CONTROLLER'
                        if (t.includes('deposit lifecycle')) return 'PAYMENT OVERLORD'
                        if (t.includes('tools: create booking')) return 'BOOKING ARCHITECT'
                        if (t.includes('seed/backfill utilities')) return 'DATA SEEDER'
                        if (t.includes('safer recompute totals')) return 'CALC GUARDIAN'
                        if (t.includes('synthesize payments fixed')) return 'PAYMENT FIXER'
                        if (t.includes('hold booking payment')) return 'CORRUPTION HUNTER'
                        if (t.includes('scoreboard pills')) return 'METRICS COMMANDER'
                        if (t.includes('pagination, preserved filters')) return 'UI STRATEGIST'
                        if (t.includes('scheduled payments hidden')) return 'DISPLAY OPTIMIZER'
                        if (t.includes('responsive table')) return 'TABLE MASTER'
                        if (t.includes('refund button logic')) return 'REFUND SPECIALIST'
                        if (t.includes('crm dashboard')) return 'CRM OVERLORD'
                        if (t.includes('most profitable cities')) return 'PROFIT TRACKER'
                        if (t.includes('mvp progress tracker')) return 'PROGRESS KING'
                        if (t.includes('admin productivity toolkit')) return 'TOOL COMMANDER'
                        if (t.includes('edit details: title')) return 'LISTING EDITOR'
                        if (t.includes('pricing controls')) return 'PRICE STRATEGIST'
                        if (t.includes('media management')) return 'MEDIA OVERLORD'
                        if (t.includes('per‑property availability')) return 'CALENDAR CHIEF'
                        if (t.includes('quick test booking')) return 'TEST SPECIALIST'
                        if (t.includes('prisma schema')) return 'SCHEMA ARCHITECT'
                        if (t.includes('scoreboard counts')) return 'QUERY MASTER'
                        if (t.includes('adminoverride model')) return 'OVERRIDE GUARDIAN'
                        if (t.includes('performance indexes')) return 'INDEX COMMANDER'
                        if (t.includes('data model hardening')) return 'VALIDATION CHIEF'
                        if (t.includes('start‑server.bat')) return 'DEPLOY COMMANDER'
                        if (t.includes('start‑server‑desktop')) return 'DESKTOP SPECIALIST'
                        if (t.includes('backup/restore')) return 'BACKUP GUARDIAN'
                        if (t.includes('/api/health')) return 'HEALTH MONITOR'
                        if (t.includes('env validator')) return 'CONFIG VALIDATOR'
                        if (t.includes('docker‑compose.prod')) return 'PROD ARCHITECT'
                        if (t.includes('production build blockers')) return 'BUILD FIXER'
                        if (t.includes('production deployment')) return 'DEPLOY MASTER'
                        if (t.includes('development timer: database')) return 'TIME OVERLORD'
                        if (t.includes('timer persistence perfected')) return 'PERSISTENCE KING'
                        if (t.includes('timer performance optimized')) return 'OPTIMIZATION GURU'
                        if (t.includes('component expand/collapse')) return 'EVENT SPECIALIST'
                        if (t.includes('accomplishments ui improved')) return 'UI PERFECTIONIST'
                        return 'ELITE OPERATIVE'
                      }
                      return (
                        <div key={i} className="group relative bg-gray-900/80 border border-gray-700 rounded-lg p-2 hover:border-amber-400/40 transition-all duration-200">
                          {/* Compact Header */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                              {getAchievementIcon(it)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-amber-300 font-bold text-xs truncate">{getAchievementTitle(it)}</div>
                            </div>
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* XP Badge */}
                          <div className="mb-2">
                            <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">{getXPReward(it)}</span>
                          </div>
                          
                          {/* Compact Description */}
                          <div className="text-gray-400 text-xs leading-tight line-clamp-2 mb-2">{it}</div>
                          
                          {/* Status */}
                          <div className="text-emerald-400 font-medium text-xs text-center">COMPLETED</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
