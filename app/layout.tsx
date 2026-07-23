import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🍳 Matappen - Din matlagingsassistent',
  description: 'Enkel matlaging for alle - steg for steg med bilder og opplesning',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#E31837',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Matappen',
  },
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
        <nav className="bg-red-600 text-white p-4 shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            {/* App-navn - linker til forsiden */}
            <a href="/" className="text-2xl font-bold flex items-center gap-2">
              🍳 Matappen
            </a>

            {/* Høyre side - handleliste og innlogging */}
            <div className="flex items-center gap-3">
              <a href="/handleliste" className="hover:underline text-sm flex items-center gap-1">
                🛒 Handleliste
              </a>
              <a href="/auth" className="hover:underline text-sm flex items-center gap-1">
                👤 Logg inn
              </a>
            </div>
          </div>
        </nav>

        {/* 📄 HOVEDINNHOLD */}
        <main className="max-w-6xl mx-auto p-4 pb-24">
          {children}
        </main>

        {/* 📱 BUNN-NAVIGASJON (mobil) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 px-2 z-50 shadow-lg">
          {/* Hjem */}
          <a 
            href="/" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <span>Hjem</span>
          </a>

          {/* Kategorier */}
          <a 
            href="/kategorier" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">📂</span>
            <span>Kategorier</span>
          </a>

          {/* Måltidsplanlegger */}
          <a 
            href="/matplanlegger" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🗓️</span>
            <span>Planlegger</span>
          </a>

          {/* Handleliste */}
          <a 
            href="/handleliste" 
            className="flex flex-col items-center text-xs text-gray-600 hover:text-red-600 active:text-red-800 transition-colors"
          >
            <span className="text-2xl">🛒</span>
            <span>Handleliste</span>
          </a>

          {/* Favoritter */}
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
