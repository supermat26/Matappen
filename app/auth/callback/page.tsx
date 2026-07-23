'use client'

import { useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">⏳ Laster...</div>}>
      <CallbackContent />
    </Suspense>
  )
}

function CallbackContent() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Hent hash-fragmentet fra URL-en (Supabase sender token her)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && type === 'signup') {
        // Bekreft session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (error) {
          console.error('Feil ved bekreftelse:', error)
          router.push('/auth?error=confirm_failed')
        } else {
          // Vellykket bekreftelse
          router.push('/?confirmed=true')
        }
      } else {
        // Hvis ingen token, send til login
        router.push('/auth')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">⏳</div>
      <h1 className="text-2xl font-bold mb-2">Bekrefter e-post...</h1>
      <p className="text-gray-500">Vennligst vent mens vi bekrefter kontoen din.</p>
    </div>
  )
}