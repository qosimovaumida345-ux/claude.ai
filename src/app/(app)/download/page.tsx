'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Apple, Terminal, Smartphone, Download, ChevronRight, Zap, Shield, Wifi, Star } from 'lucide-react'
import Image from 'next/image'

const GITHUB = 'https://github.com/qosimovaumida345-ux/claude.ai/releases/latest/download'
const VERSION = 'v1.0.6'

const PLATFORMS = [
  {
    id: 'windows',
    icon: Monitor,
    name: 'Windows',
    sub: 'Windows 10 / 11',
    desc: '64-bit installer',
    file: 'Claude.Fan-Made_1.0.0_x64-setup.exe',
    ext: 'EXE',
    size: '~85 MB',
    color: '#38bdf8',
    glow: '56,189,248',
    badge: 'Most Popular',
    badgeColor: '#38bdf8',
  },
  {
    id: 'macos',
    icon: Apple,
    name: 'macOS',
    sub: 'macOS 11 Big Sur+',
    desc: 'Universal binary',
    file: 'Claude.Fan-Made_1.0.0_x64.dmg',
    ext: 'DMG',
    size: '~92 MB',
    color: '#a78bfa',
    glow: '167,139,250',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'linux',
    icon: Terminal,
    name: 'Linux',
    sub: 'Ubuntu / Debian',
    desc: 'AppImage portable',
    file: 'Claude.Fan-Made_1.0.0_amd64.AppImage',
    ext: 'AppImage',
    size: '~78 MB',
    color: '#fb923c',
    glow: '251,146,60',
    badge: null,
    badgeColor: '',
  },
  {
    id: 'android',
    icon: Smartphone,
    name: 'Android',
    sub: 'Android 8.0 Oreo+',
    desc: 'APK sideload',
    file: 'app-release-unsigned.apk',
    ext: 'APK',
    size: '~45 MB',
    color: '#34d399',
    glow: '52,211,153',
    badge: 'New',
    badgeColor: '#34d399',
  },
]

const STATS = [
  { value: '50K+', label: "Foydalanuvchi" },
  { value: '4.9', label: "Reyting", icon: Star },
  { value: '99.9%', label: "Uptime" },
  { value: '4', label: "Platforma" },
]

export default function DownloadPage() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const handleDownload = (platform: typeof PLATFORMS[0]) => {
    setDownloaded(platform.id)
    window.open(`${GITHUB}/${platform.file}`, '_blank')
    setTimeout(() => setDownloaded(null), 3000)
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden select-none"
      style={{
        background: '#080C14',
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,205,217,0.04), transparent 60%)`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Top gradient beam */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[1px] z-0"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,205,217,0.5), transparent)' }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] z-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse at top, #00CDD9 0%, transparent 70%)' }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,205,217,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,205,217,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-[8%] w-[300px] h-[300px] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, #0096c7 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <motion.div
        animate={{ y: [0, 20, 0], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-[8%] w-[350px] h-[350px] rounded-full z-0"
        style={{ background: 'radial-gradient(circle, #00CDD9 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 lg:py-24">

        {/* NAV */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-24"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00CDD9, #0096c7)', padding: '2px' }}
            >
              <Image
                src="public/images/minimax.png"
                alt="Claude Fan-Made"
                width={36}
                height={36}
                className="rounded-lg w-full h-full object-cover"
              />
            </div>
            <span
              className="font-semibold text-base tracking-tight"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              Claude <span style={{ color: '#00CDD9' }}>Fan-Made</span>
            </span>
          </div>

          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: 'rgba(0,205,217,0.06)',
              border: '1px solid rgba(0,205,217,0.15)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#00CDD9' }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: 'rgba(0,205,217,0.7)' }}
            >
              {VERSION} — Barcha platformalar
            </span>
          </div>
        </motion.nav>

        {/* HERO */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-sm font-medium"
            style={{
              background: 'rgba(0,205,217,0.07)',
              border: '1px solid rgba(0,205,217,0.2)',
              color: '#00CDD9',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Bepul yuklab oling
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight"
          >
            <span style={{ color: 'rgba(255,255,255,0.95)' }}>Qurilmangizga</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #00CDD9, #38bdf8, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              o'rnating
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Claude Fan-Made ilovasini platformangizga o'rnating.
            Tezkor, xavfsiz, oflayn rejimli AI tajribasi.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="inline-flex items-center gap-0 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center px-6 py-3"
                style={{
                  borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {s.value}
                  </span>
                  {s.icon && <s.icon className="w-4 h-4" style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                </div>
                <span className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* PLATFORM CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {PLATFORMS.map((platform, i) => {
            const Icon = platform.icon
            const isHovered = hovered === platform.id
            const isDone = downloaded === platform.id

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                onMouseEnter={() => setHovered(platform.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleDownload(platform)}
                className="relative cursor-pointer"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glow behind card */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl -z-10"
                      style={{
                        background: `radial-gradient(ellipse at 50% 0%, rgba(${platform.glow},0.15), transparent 70%)`,
                        filter: 'blur(20px)',
                        transform: 'translateY(8px) scale(1.02)',
                      }}
                    />
                  )}
                </AnimatePresence>

                <div
                  className="relative rounded-2xl p-6 transition-all duration-300 overflow-hidden"
                  style={{
                    background: isHovered
                      ? `rgba(${platform.glow},0.05)`
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isHovered
                      ? `rgba(${platform.glow},0.4)`
                      : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {/* Top line accent */}
                  <motion.div
                    className="absolute top-0 left-8 right-8 h-[1px]"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${platform.glow},0.6), transparent)`,
                      opacity: isHovered ? 1 : 0,
                      transition: 'opacity 0.3s',
                    }}
                  />

                  {/* Badge */}
                  {platform.badge && (
                    <div
                      className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                      style={{
                        background: `rgba(${platform.glow},0.12)`,
                        color: platform.color,
                        border: `1px solid rgba(${platform.glow},0.3)`,
                      }}
                    >
                      {platform.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Icon box */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isHovered
                          ? `rgba(${platform.glow},0.12)`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isHovered
                          ? `rgba(${platform.glow},0.35)`
                          : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6 transition-all duration-300"
                        style={{ color: isHovered ? platform.color : 'rgba(255,255,255,0.3)' }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3
                          className="text-base font-semibold transition-colors duration-300"
                          style={{ color: isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)' }}
                        >
                          {platform.name}
                        </h3>
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: `rgba(${platform.glow},0.1)`,
                            color: platform.color,
                          }}
                        >
                          {platform.ext}
                        </span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {platform.sub}
                      </p>
                      <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        <span>{platform.desc}</span>
                        <span>·</span>
                        <span>{platform.size}</span>
                      </p>
                    </div>

                    {/* CTA arrow */}
                    <motion.div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: isDone
                          ? 'rgba(0,205,217,0.15)'
                          : isHovered
                          ? `rgba(${platform.glow},0.15)`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isDone
                          ? 'rgba(0,205,217,0.5)'
                          : isHovered
                          ? `rgba(${platform.glow},0.4)`
                          : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {isDone ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="text-sm"
                            style={{ color: '#00CDD9' }}
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <motion.div key="arrow">
                            <ChevronRight
                              className="w-4 h-4 transition-all duration-300"
                              style={{ color: isHovered ? platform.color : 'rgba(255,255,255,0.2)' }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FEATURES ROW */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex items-center justify-center gap-8 mb-16 flex-wrap"
        >
          {[
            { icon: Zap, text: 'Tezkor javoblar' },
            { icon: Shield, text: 'Xavfsiz va mahalliy' },
            { icon: Wifi, text: 'Oflayn rejim' },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Icon className="w-4 h-4" style={{ color: '#00CDD9' }} />
              {text}
            </div>
          ))}
        </motion.div>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="text-center"
        >
          <motion.button
            onClick={() => handleDownload(PLATFORMS[0])}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-semibold text-white text-base overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00CDD9 0%, #0096c7 100%)',
              boxShadow: '0 0 60px rgba(0,205,217,0.25), 0 0 0 1px rgba(0,205,217,0.3)',
            }}
          >
            {/* Shine */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
                animation: 'shine 3s infinite',
              }}
            />
            <Download className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Windows uchun yuklab olish</span>
            <span
              className="relative z-10 font-mono text-sm"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {VERSION}
            </span>
          </motion.button>

          <p className="mt-5 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Barcha versiyalar uchun{' '}
            <a
              href="https://github.com/qosimovaumida345-ux/claude.ai/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors duration-200"
              style={{ color: 'rgba(0,205,217,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00CDD9')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,205,217,0.5)')}
            >
              GitHub Releases
            </a>{' '}
            sahifasini ko'ring
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-24 pt-8 text-center text-xs"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.15)',
          }}
        >
          © 2024 Claude Fan-Made · Rasmiy Claude mahsuloti emas · Faqat o'quv maqsadida
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}