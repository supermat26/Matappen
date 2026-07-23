'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Oppskrift } from '@/lib/oppskrifter'

export default function FavoritterPage() {
  const [favoritter, setFavoritter] = useState<Oppskrift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function hentFavoritter() {
      // Hent favoritt-IDer fra localStorage
      let favorittIds: string[] = []
      try {
        favorittIds = JSON.parse(localStorage.getItem('favoritter') || '[]')
      } catch {
        favorittIds = []
      }

      if (favorittIds.length === 0) {
        setFavoritter([])
        setLoading(false)
        return
      }

      // Hent oppskriftene fra Supabase
      const { data, error } = await supabase
        .from('oppskrifter')
        .select('*')
        .in('id', favorittIds)

      if (error) {
        console.error('Feil ved henting av favoritter:', error)
        setFavoritter([])
      } else {
        setFavoritter(data || [])
      }
      setLoading(false)
    }

    hentFavoritter()
  }, [])

  // Fjern favoritt
  const fjernFavoritt = (id: string) => {
    const favorittIds = JSON.parse(localStorage.getItem('favoritter') || '[]')
    const nye = favorittIds.filter((fid: string) => fid !== id)
    localStorage.setItem('favoritter', JSON.stringify(nye))
    setFavoritter(favoritter.filter((f) => f.id !== id))
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Laster favoritter...</p>
      </div>
    )
  }

  if (favoritter.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <p className="text-gray-600 text-lg">Du har ingen favoritter ennå</p>
        <p className="text-gray-500 mt-2">
          Trykk på ❤️ ved oppskrifter for å lagre dem her
        </p>
        <Link
          href="/"
          className="inline-block mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 active:bg-red-800"
        >
          Se oppskrifter
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">❤️ Mine favoritter ({favoritter.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {favoritter.map((oppskrift) => (
          <div key={oppskrift.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <Link href={`/oppskrifter/${oppskrift.id}`}>
              {oppskrift.bilde_url && (
                <div className="h-40 bg-gray-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={oppskrift.bilde_url}
                    alt={oppskrift.tittel}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{oppskrift.tittel}</h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">{oppskrift.kategori}</span>
                  <span>⏱ {oppskrift.prep_time || 30} min</span>
                </div>
              </div>
            </Link>
            <button
              onClick={() => fjernFavoritt(oppskrift.id)}
              className="w-full text-red-500 text-sm py-2 border-t hover:bg-red-50 transition-colors"
            >
              Fjern fra favoritter
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
