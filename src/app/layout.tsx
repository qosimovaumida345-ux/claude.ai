import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Claude Fan-Made',
  description: 'AI assistant fan-made clone',
  icons: { icon: '/favicon.ico' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#1a1a1a',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px'
              }
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
