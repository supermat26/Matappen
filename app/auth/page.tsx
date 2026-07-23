'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Registrering vellykket! Sjekk e-posten din for bekreftelse.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? '🔐 Logg inn' : '📝 Registrer deg'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
              placeholder="din@epost.no"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-base"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 active:bg-red-800 disabled:opacity-50 transition-colors"
          >
            {loading ? '⏳ Laster...' : mode === 'login' ? 'Logg inn' : 'Registrer'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Har du ikke konto?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-red-600 hover:underline font-medium"
              >
                Registrer deg
              </button>
            </>
          ) : (
            <>
              Har du allerede konto?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-red-600 hover:underline font-medium"
              >
                Logg inn
              </button>
            </>
          )}
        </div>

        {/* Gjestemodus (valgfritt) */}
        <div className="mt-4 border-t pt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Fortsett som gjest (begrenset funksjonalitet)
          </button>
        </div>
      </div>
    </div>
  )
}
