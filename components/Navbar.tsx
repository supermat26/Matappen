'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="bg-red-600 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* App-navn */}
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          🍳 Matappen
        </Link>

        {/* Høyre side */}
        <div className="flex items-center gap-3">
          <Link href="/handleliste" className="hover:underline text-sm flex items-center gap-1">
            🛒 Handleliste
          </Link>

          {loading ? (
            <span className="text-sm">⏳</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/profil" 
                className="text-sm hover:underline hidden sm:inline-flex items-center gap-1"
              >
                👤 {user.email?.split('@')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm hover:underline flex items-center gap-1"
              >
                🚪 Logg ut
              </button>
            </div>
          ) : (
            <Link href="/auth" className="hover:underline text-sm flex items-center gap-1">
              👤 Logg inn
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}