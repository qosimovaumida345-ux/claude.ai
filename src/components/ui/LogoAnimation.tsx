'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  spinning?: boolean
  size?: number
  className?: string
}

export default function LogoAnimation({ spinning = false, size = 32, className }: Props) {
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <AnimatePresence>
        {spinning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div
              style={{ width: size, height: size }}
              className="rounded-full border-2 border-[#00CDD9] border-t-transparent animate-spin"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={spinning ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0.3 }}
      >
        <motion.path
          d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
          stroke="#00CDD9"
          strokeWidth="1.5"
          fill="none"
          animate={spinning ? { strokeOpacity: [1, 0.4, 1] } : { strokeOpacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M20 10L28 15V25L20 30L12 25V15L20 10Z"
          fill="#00CDD9"
          animate={spinning ? { fillOpacity: [0.15, 0.4, 0.15] } : { fillOpacity: 0.15 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          cx="20"
          cy="20"
          r="3.5"
          fill="#00CDD9"
          animate={spinning ? { r: [3.5, 5, 3.5] } : { r: 3.5 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  )
}
