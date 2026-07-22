'use client'

import { useState } from 'react'
import type { Ingrediens } from '@/lib/oppskrifter'

interface Props {
  ingredienser: Ingrediens[]
}

export default function LeggTilHandleliste({ ingredienser }: Props) {
  const [lagtTil, setLagtTil] = useState(false)

  const leggTilAlle = () => {
    // Hent eksisterende handleliste
    const eksisterende = JSON.parse(localStorage.getItem('handleliste') || '[]')
    
    // Legg til alle ingredienser (unngå duplikater)
    const nye = ingredienser.filter(
      (ing) => !eksisterende.some((e: any) => e.navn === ing.navn)
    )
    
    const oppdatert = [...eksisterende, ...nye]
    localStorage.setItem('handleliste', JSON.stringify(oppdatert))
    
    setLagtTil(true)
    setTimeout(() => setLagtTil(false), 3000)
  }

  return (
    <button
      onClick={leggTilAlle}
      className={`mt-4 w-full py-3 rounded-lg font-semibold transition-colors ${
        lagtTil
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
    >
      {lagtTil ? '✅ Lagt til i handlelisten!' : '🛒 Legg alle i handlelisten'}
    </button>
  )
}
