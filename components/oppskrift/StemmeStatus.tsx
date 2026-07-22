'use client'

import { useState, useEffect } from 'react'

export default function StemmeStatus() {
  const [stemmeStatus, setStemmeStatus] = useState<string>('Sjekker...')

  const sjekkStemmer = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setStemmeStatus('❌ Ikke støttet')
      return
    }

    const voices = window.speechSynthesis.getVoices()
    const norske = voices.filter(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
    
    if (norske.length > 0) {
      setStemmeStatus(`✅ ${norske.length} norske stemmer: ${norske.map(v => v.name).join(', ')}`)
    } else if (voices.length > 0) {
      setStemmeStatus(`⚠️ ${voices.length} stemmer funnet, men ingen norske. Bruker standard.`)
    } else {
      setStemmeStatus('⏳ Ingen stemmer lastet ennå. Prøv å trykk "Last stemmer".')
    }
  }

  useEffect(() => {
    // Forsøk å laste stemmer
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        sjekkStemmer()
      }
      
      // Sjekk etter en liten forsinkelse
      setTimeout(sjekkStemmer, 1000)
    }
  }, [])

  return (
    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <span>🔊</span>
        <span className="flex-1">{stemmeStatus}</span>
        <button
          onClick={sjekkStemmer}
          className="px-3 py-1 bg-gray-200 rounded text-gray-700 text-xs hover:bg-gray-300 touch-manipulation"
          style={{ minHeight: '36px' }}
        >
          Last stemmer
        </button>
      </div>
    </div>
  )
}