'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CheckAuthPage() {
  const [status, setStatus] = useState('Sjekker...')
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const check = async () => {
      // Sjekk session
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      // Sjekk user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        setStatus(`✅ Logget inn som ${user.email}`)
      } else {
        setStatus('❌ Ikke logget inn')
      }
    }
    check()

    // Lytt på endringer
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user || null)
        if (session?.user) {
          setStatus(`✅ Logget inn som ${session.user.email}`)
        } else {
          setStatus('❌ Ikke logget inn')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔐 Auth Status</h1>
      
      <div className={`p-4 rounded-lg mb-4 ${user ? 'bg-green-50' : 'bg-red-50'}`}>
        <p className={`font-bold ${user ? 'text-green-700' : 'text-red-700'}`}>
          {status}
        </p>
      </div>

      {user && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p><strong>E-post:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Bekreftet:</strong> {user.confirmed_at ? '✅ Ja' : '❌ Nei'}</p>
        </div>
      )}

      {session && (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <p><strong>Session:</strong> {session.access_token ? '✅ Gyldig' : '❌ Ugyldig'}</p>
          <p><strong>Utløper:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={async () => {
            const { data } = await supabase.auth.getSession()
            alert('Session: ' + JSON.stringify(data, null, 2))
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          🔍 Sjekk session
        </button>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.reload()
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          🚪 Logg ut
        </button>
      </div>
    </div>
  )
}