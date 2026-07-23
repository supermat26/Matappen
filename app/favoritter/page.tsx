'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Oppskrift } from '@/lib/oppskrifter'

export default function FavoritterPage() {
  const [favoritter, setFavoritter] = useState<Oppskrift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function hentFavoritter() {
      setLoading(true)
      setError('')

      try {
        // 1. Hent favoritt-IDer fra localStorage
        let favorittIds: string[] = []
        try {
          const stored = localStorage.getItem('favoritter')
          console.log('📦 localStorage favoritter:', stored)
          favorittIds = stored ? JSON.parse(stored) : []
        } catch (parseError) {
          console.error('❌ Feil ved parsing av localStorage:', parseError)
          favorittIds = []
        }

        console.log('📋 Favoritt-IDer:', favorittIds)

        if (favorittIds.length === 0) {
          setFavoritter([])
          setLoading(false)
          return
        }

        // 2. Hent oppskriftene fra Supabase
        const { data, error } = await supabase
          .from('oppskrifter')
          .select('*')
          .in('id', favorittIds)

        if (error) {
          console.error('❌ Supabase-feil:', error)
          setError('Kunne ikke hente favoritter: ' + error.message)
          setFavoritter([])
        } else {
          console.log('✅ Fant oppskrifter:', data?.length || 0)
          
          // Sorter i samme rekkefølge som favorittIds
          const sortert = favorittIds
            .map(id => data?.find((o: Oppskrift) => o.id === id))
            .filter((o): o is Oppskrift => o !== undefined)
          
          setFavoritter(sortert)
        }
      } catch (err) {
        console.error('❌ Uventet feil:', err)
        setError('Noe gikk galt ved henting av favoritter')
      } finally {
        setLoading(false)
      }
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

  // Legg til en test-favoritt (for debugging)
  const leggTilTestFavoritt = async () => {
    // Hent en tilfeldig oppskrift
    const { data } = await supabase
      .from('oppskrifter')
      .select('id')
      .limit(1)
    
    if (data && data.length > 0) {
      const favorittIds = JSON.parse(localStorage.getItem('favoritter') || '[]')
      if (!favorittIds.includes(data[0].id)) {
        favorittIds.push(data[0].id)
        localStorage.setItem('favoritter', JSON.stringify(favorittIds))
        alert('✅ Test-favoritt lagt til! Oppdater siden.')
        window.location.reload()
      } else {
        alert('⚠️ Denne oppskriften er allerede i favoritter')
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Laster favoritter...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Noe gikk galt</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Prøv igjen
        </button>
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

        {/* Debug: Skjult knapp for testing */}
        <button
          onClick={leggTilTestFavoritt}
          className="mt-8 text-xs text-gray-400 hover:text-gray-600 underline"
        >
          🔧 Legg til test-favoritt (debug)
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">❤️ Mine favoritter</h1>
        <span className="text-sm text-gray-500">{favoritter.length} oppskrifter</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoritter.map((oppskrift) => (
          <div key={oppskrift.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <Link href={`/oppskrifter/${oppskrift.id}`}>
              {oppskrift.bilde_url && (
                <div className="h-48 bg-gray-200 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={oppskrift.bilde_url}
                    alt={oppskrift.tittel}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hvis bilde ikke lastes, vis placeholder
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                  {oppskrift.tittel}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                    {oppskrift.kategori}
                  </span>
                  <span>⏱ {oppskrift.prep_time || 30} min</span>
                </div>
                {oppskrift.beskrivelse && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {oppskrift.beskrivelse}
                  </p>
                )}
              </div>
            </Link>
            <button
              onClick={() => fjernFavoritt(oppskrift.id)}
              className="w-full text-red-500 text-sm py-2 border-t hover:bg-red-50 transition-colors"
            >
              🗑️ Fjern fra favoritter
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}