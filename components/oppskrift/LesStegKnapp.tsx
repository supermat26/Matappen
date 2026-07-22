'use client'

import { useState } from 'react'

interface Props {
  tekst: string
  stegNummer: number
}

export default function LesStegKnapp({ tekst, stegNummer }: Props) {
  const [leser, setLeser] = useState(false)

  const lesOpp = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Din nettleser støtter ikke opplesning.')
      return
    }

    const speechSynth = window.speechSynthesis

    if (leser) {
      speechSynth.cancel()
      setLeser(false)
      return
    }

    setLeser(true)

    const utterance = new SpeechSynthesisUtterance(`Steg ${stegNummer}: ${tekst}`)
    utterance.lang = 'nb-NO'
    utterance.rate = 0.85
    utterance.pitch = 1

    utterance.onend = () => {
      setLeser(false)
    }

    utterance.onerror = () => {
      setLeser(false)
    }

    speechSynth.speak(utterance)
  }

  return (
    <button
      onClick={lesOpp}
      className={`text-sm px-3 py-1 rounded transition-colors ${
        leser
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {leser ? '⏹️ Stopp' : '🔊 Lytt'}
    </button>
  )
}
