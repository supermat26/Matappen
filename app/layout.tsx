import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🍳 Matappen - Din matlagingsassistent',
  description: 'Enkel matlaging for alle - steg for steg med bilder og opplesning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body className={inter.className}>
        <nav className="bg-red-600 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="text-2xl font-bold">
              🍳 Matappen
            </a>
            <div className="flex gap-4">
              <a href="/handleliste" className="hover:underline">
                🛒 Handleliste
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}