'use client'

import { useState } from 'react'
import type { Steg } from '@/lib/oppskrifter'

interface Props {
  steg: Steg[]
}

export default function Opplesningsknapp({ steg }: Props) {
  const [leser, setLeser] = useState(false)

  const lesOpp = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Din nettleser støtter ikke opplesning. Prøv Chrome, Edge eller Safari.')
      return
    }

    if (leser) {
      window.speechSynthesis.cancel()
      setLeser(false)
      return
    }

    setLeser(true)

    // Sett opp tale
    const tekst = steg.map((s, i) => `Steg ${i + 1}: ${s.beskrivelse}`).join('. ')
    
    const utterance = new SpeechSynthesisUtterance(tekst)
    utterance.lang = 'no-NO'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onend = () => {
      setLeser(false)
    }

    utterance.onerror = () => {
      setLeser(false)
      alert('Det oppstod en feil under opplesning.')
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      onClick={lesOpp}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
        leser
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {leser ? (
        <>
          <span>⏹️</span> Stopp opplesning
        </>
      ) : (
        <>
          <span>🔊</span> Les opp alle steg
        </>
      )}
    </button>
  )
}
