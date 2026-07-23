'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  tekst: string
  stegNummer: number
}

export default function LesStegKnapp({ tekst, stegNummer }: Props) {
  const [leser, setLeser] = useState(false)
  const [feil, setFeil] = useState('')
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const lesOpp = () => {
    if (!synthRef.current) {
      setFeil('Tale ikke tilgjengelig')
      return
    }

    if (leser) {
      synthRef.current.cancel()
      setLeser(false)
      return
    }

    const voices = synthRef.current.getVoices()
    if (voices.length === 0) {
      setFeil('Laster stemmer... prøv igjen')
      setTimeout(() => setFeil(''), 2000)
      return
    }

    setLeser(true)
    setFeil('')

    const utterance = new SpeechSynthesisUtterance(`Steg ${stegNummer}: ${tekst}`)
    utterance.lang = 'nb-NO'
    utterance.rate = 0.85
    utterance.pitch = 1

    const norskStemme = voices.find(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
    if (norskStemme) {
      utterance.voice = norskStemme
    }

    utterance.onend = () => {
      setLeser(false)
    }

    utterance.onerror = () => {
      setLeser(false)
      setFeil('Feil ved opplesning')
      setTimeout(() => setFeil(''), 2000)
    }

    synthRef.current.speak(utterance)
  }

  return (
    <div>
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
      {feil && <p className="text-xs text-red-500 mt-1">{feil}</p>}
    </div>
  )
}