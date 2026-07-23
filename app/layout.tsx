import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🍳 Matappen - Din matlagingsassistent',
  description: 'Enkel matlaging for alle - steg for steg med bilder og opplesning',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Matappen',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E31837',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} pb-20`}>
        {/* 🔝 TOPP-NAVIGASJON */}
        <Navbar />

        {/* 📄 HOVEDINNHOLD */}
        <main className="max-w-6xl mx-auto p-4 pb-24">
          {children}
        </main>

        {/* 📱 BUNN-NAVIGASJON (mobil) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-50 shadow-lg">
          <a 
            href="/" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <span>Hjem</span>
          </a>
          <a 
            href="/kategorier" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">📂</span>
            <span>Kategorier</span>
          </a>
          <a 
            href="/matplanlegger" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🗓️</span>
            <span>Planlegger</span>
          </a>
          <a 
            href="/handleliste" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🛒</span>
            <span>Handleliste</span>
          </a>
          <a 
            href="/favoritter" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">❤️</span>
            <span>Favoritter</span>
          </a>
        </nav>
      </body>
    </html>
  )
}