'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/auth')
        return
      }
      setUser(data.user)
      setLoading(false)
    }
    getUser()
  }, [router])

  if (loading) {
    return <div className="text-center py-12">⏳ Laster...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👤 Min profil</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">E-post</label>
            <p className="text-lg font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Bruker-ID</label>
            <p className="text-sm font-mono text-gray-600">{user?.id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Konto opprettet</label>
            <p className="text-sm text-gray-600">
              {new Date(user?.created_at).toLocaleDateString('no-NO')}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
        >
          🚪 Logg ut
        </button>
      </div>
    </div>
  )
}