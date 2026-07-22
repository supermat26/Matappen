'use client'

import { useState, useEffect } from 'react'

interface Props {
  tekst: string
  stegNummer: number
}

export default function LesStegKnapp({ tekst, stegNummer }: Props) {
  const [leser, setLeser] = useState(false)
  const [stotte, setStotte] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setStotte(false)
    }
  }, [])

  const lesOpp = () => {
    if (!stotte) {
      alert('Nettleseren støtter ikke opplesning')
      return
    }

    const synth = window.speechSynthesis

    if (leser) {
      synth.cancel()
      setLeser(false)
      return
    }

    setLeser(true)

    const utterance = new SpeechSynthesisUtterance(`Steg ${stegNummer}: ${tekst}`)
    utterance.lang = 'nb-NO'
    utterance.rate = 0.85
    utterance.pitch = 1

    // Prøv å finne norsk stemme
    const voices = synth.getVoices()
    const norskStemme = voices.find(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
    if (norskStemme) {
      utterance.voice = norskStemme
    }

    utterance.onend = () => {
      setLeser(false)
    }

    utterance.onerror = () => {
      setLeser(false)
    }

    synth.speak(utterance)
  }

  return (
    <button
      onClick={lesOpp}
      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors touch-manipulation ${
        leser
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
      }`}
      style={{ minHeight: '44px' }}
    >
      {leser ? '⏹️' : '🔊'} 
      <span>{leser ? 'Stopp' : 'Lytt'}</span>
    </button>
  )
}