'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

// Hovedkomponenten med Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">⏳ Laster...</div>}>
      <AuthContent />
    </Suspense>
  )
}

// Innholdet som bruker useSearchParams
function AuthContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Sjekk om det er en feil fra callback
    const errorParam = searchParams?.get('error')
    if (errorParam === 'confirm_failed') {
      setError('Bekreftelse feilet. Prøv igjen eller kontakt support.')
    }

    // Sjekk om brukeren allerede er logget inn
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/')
      }
    }
    checkUser()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setSuccess('📧 Registrering vellykket! Sjekk e-posten din for bekreftelse.')
        setMode('login')
      }
    } catch (err: any) {
      setError(err.message || 'Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  // Resend confirmation email
  const resendConfirmation = async () => {
    if (!email) {
      setError('Skriv inn e-postadressen din først.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setSuccess('📧 Ny bekreftelses-e-post sendt! Sjekk innboksen din.')
    } catch (err: any) {
      setError(err.message || 'Kunne ikke sende på nytt.')
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

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              {success}
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

        {/* Resend confirmation */}
        {mode === 'register' && (
          <div className="mt-4 text-center">
            <button
              onClick={resendConfirmation}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              Send bekreftelses-e-post på nytt
            </button>
          </div>
        )}

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

        <div className="mt-4 border-t pt-4 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Fortsett som gjest (begrenset funksjonalitet)
          </button>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
          💡 <strong>Tips:</strong> Sjekk søppelpost-mappen hvis du ikke finner bekreftelses-e-posten.
        </div>
      </div>
    </div>
  )
}