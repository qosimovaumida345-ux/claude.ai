'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Apple, Terminal, Smartphone, Download, ChevronRight, Zap, Shield, Wifi } from 'lucide-react'

const GITHUB = 'https://github.com/qosimovaumida345-ux/claude.ai/releases/latest/download'
const VERSION = 'v1.0.6'

const PLATFORMS = [
  {
    id: 'windows',
    icon: Monitor,
    name: 'Windows',
    sub: 'Windows 10 / 11',
    file: 'Claude.Fan-Made_1.0.0_x64-setup.exe',
    ext: '.exe',
    color: '#00b4d8',
    glow: 'rgba(0,180,216,0.3)',
    badge: 'Most Popular'
  },
  {
    id: 'macos',
    icon: Apple,
    name: 'macOS',
    sub: 'macOS 11+',
    file: 'Claude.Fan-Made_1.0.0_x64.dmg',
    ext: '.dmg',
    color: '#a8dadc',
    glow: 'rgba(168,218,220,0.3)',
    badge: null
  },
  {
    id: 'linux',
    icon: Terminal,
    name: 'Linux',
    sub: 'Ubuntu / Debian',
    file: 'Claude.Fan-Made_1.0.0_amd64.AppImage',
    ext: '.AppImage',
    color: '#e9c46a',
    glow: 'rgba(233,196,106,0.3)',
    badge: null
  },
  {
    id: 'android',
    icon: Smartphone,
    name: 'Android',
    sub: 'Android 8.0+',
    file: 'app-release-unsigned.apk',
    ext: '.apk',
    color: '#90e0ef',
    glow: 'rgba(144,224,239,0.3)',
    badge: 'New'
  }
]

const FEATURES = [
  { icon: Zap, text: 'Tezkor javoblar' },
  { icon: Shield, text: 'Xavfsiz va mahalliy' },
  { icon: Wifi, text: 'Oflayn rejim' },
]

export default function DownloadPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<string | null>(null)

  const handleDownload = (platform: typeof PLATFORMS[0]) => {
    setDownloaded(platform.id)
    window.open(`${GITHUB}/${platform.file}`, '_blank')
    setTimeout(() => setDownloaded(null), 3000)
  }

  return (
    <div className="min-h-screen bg-[#020818] text-white overflow-hidden relative">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00CDD9 1px, transparent 1px), linear-gradient(90deg, #00CDD9 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* Glow orbs */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, #00CDD9 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-100px] left-[10%] w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(ellipse, #0096c7 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00CDD9, #0096c7)' }}>
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-semibold text-white/80 tracking-wide">Claude Fan-Made</span>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00CDD9] animate-pulse" />
            <span className="text-sm text-white/60 font-mono">{VERSION} — Barcha platformalar</span>
          </div>

          <h1 className="text-6xl font-bold mb-4 leading-tight">
            Yuklab olish
            <br />
            <span style={{ WebkitTextStroke: '1px rgba(0,205,217,0.5)', color: 'transparent' }}>
              platformangizni tanlang
            </span>
          </h1>
          <p className="text-white/40 text-lg max-w-md mx-auto">
            Claude Fan-Made ilovasini qurilmangizga o'rnating va AI bilan ishlashni boshlang
          </p>

          {/* Features */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/40 text-sm">
                <Icon className="w-4 h-4 text-[#00CDD9]" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {PLATFORMS.map((platform, i) => {
            const Icon = platform.icon
            const isHovered = hovered === platform.id
            const isDone = downloaded === platform.id

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => setHovered(platform.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleDownload(platform)}
                className="relative cursor-pointer group"
              >
                {/* Card */}
                <div
                  className="relative rounded-2xl border p-6 transition-all duration-300 overflow-hidden"
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, rgba(0,205,217,0.08), rgba(0,150,199,0.05))`
                      : 'rgba(255,255,255,0.03)',
                    borderColor: isHovered ? platform.color : 'rgba(255,255,255,0.07)',
                    boxShadow: isHovered ? `0 0 40px ${platform.glow}` : 'none',
                  }}
                >
                  {/* Badge */}
                  {platform.badge && (
                    <div
                      className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${platform.color}20`, color: platform.color, border: `1px solid ${platform.color}40` }}
                    >
                      {platform.badge}
                    </div>
                  )}

                  {/* Glow blob */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-opacity duration-300"
                    style={{ background: platform.color, opacity: isHovered ? 0.06 : 0 }}
                  />

                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isHovered ? `${platform.color}20` : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isHovered ? platform.color + '40' : 'transparent'}`
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: isHovered ? platform.color : 'rgba(255,255,255,0.4)' }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-white/40">{platform.sub}</p>
                      <p className="text-xs font-mono text-white/20 mt-0.5 truncate">{platform.ext} format</p>
                    </div>

                    {/* Arrow / Done */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                      style={{
                        background: isDone ? '#00CDD920' : isHovered ? `${platform.color}20` : 'transparent',
                        border: `1px solid ${isDone ? '#00CDD9' : isHovered ? platform.color + '60' : 'rgba(255,255,255,0.1)'}`
                      }}
                    >
                      {isDone
                        ? <span className="text-[#00CDD9] text-sm">✓</span>
                        : <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                            style={{ color: isHovered ? platform.color : 'rgba(255,255,255,0.2)' }} />
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Direct download button — Windows highlighted */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={() => handleDownload(PLATFORMS[0])}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #00CDD9, #0096c7)',
              boxShadow: '0 0 40px rgba(0,205,217,0.3)'
            }}
          >
            <Download className="w-5 h-5" />
            Windows uchun yuklab olish
            <span className="text-white/60 text-sm font-normal">{VERSION}</span>
          </button>

          <p className="mt-4 text-white/20 text-sm">
            Barcha versiyalar uchun{' '}
            <a
              href="https://github.com/qosimovaumida345-ux/claude.ai/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00CDD9]/60 hover:text-[#00CDD9] transition-colors underline underline-offset-4"
            >
              GitHub Releases
            </a>
            {' '}sahifasini ko'ring
          </p>
        </motion.div>

      </div>
    </div>
  )
}