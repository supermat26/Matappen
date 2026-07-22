'use client'

import type { Ingrediens } from '@/lib/oppskrifter'

interface Props {
  ingredienser: Ingrediens[]
}

export default function LeggTilHandleliste({ ingredienser }: Props) {
  const leggTilAlle = () => {
    // Hent eksisterende handleliste
    const eksisterende = JSON.parse(localStorage.getItem('handleliste') || '[]')
    
    // Legg til alle ingredienser (unngå duplikater)
    const nye = ingredienser.filter(
      (ing) => !eksisterende.some((e: any) => e.navn === ing.navn)
    )
    
    const oppdatert = [...eksisterende, ...nye]
    localStorage.setItem('handleliste', JSON.stringify(oppdatert))
    
    alert(`✅ ${nye.length} ingredienser lagt til i handlelisten!`)
  }

  return (
    <button
      onClick={leggTilAlle}
      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
    >
      🛒 Legg alle i handlelisten
    </button>
  )
}
