'use client'

import { useState, useEffect, useRef } from 'react'
import type { Steg } from '@/lib/oppskrifter'

interface Props {
  steg: Steg[]
}

export default function Opplesningsknapp({ steg }: Props) {
  const [leser, setLeser] = useState(false)
  const [erKlar, setErKlar] = useState(false)
  const [feilmelding, setFeilmelding] = useState('')
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialiser speech synthesis og last stemmer
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Sjekk støtte
    if (!('speechSynthesis' in window)) {
      setFeilmelding('Nettleseren støtter ikke tale')
      return
    }

    synthRef.current = window.speechSynthesis

    // Funksjon for å laste stemmer
    const loadVoices = () => {
      const voices = synthRef.current?.getVoices() || []
      if (voices.length > 0) {
        setErKlar(true)
        console.log('✅ Stemmer lastet:', voices.length)
        
        // Sjekk om vi har norsk stemme
        const norsk = voices.find(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
        if (norsk) {
          console.log('✅ Norsk stemme funnet:', norsk.name)
        } else {
          console.log('⚠️ Ingen norsk stemme, bruker standard')
        }
      }
    }

    // Prøv å laste stemmer med en gang
    loadVoices()

    // Vent på at stemmer lastes (viktig for mobil!)
    if (synthRef.current?.getVoices().length === 0) {
      console.log('⏳ Ventet på stemmer...')
      synthRef.current.onvoiceschanged = () => {
        loadVoices()
      }
    }

    // Rydd opp
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const lesOpp = () => {
    // Sjekk om vi har støtte
    if (!synthRef.current) {
      setFeilmelding('Tale ikke tilgjengelig')
      return
    }

    // Hvis allerede leser, stopp
    if (leser) {
      synthRef.current.cancel()
      setLeser(false)
      return
    }

    // Sjekk at det er noe å lese
    if (!steg || steg.length === 0) {
      setFeilmelding('Ingen steg å lese')
      return
    }

    // Viktig for mobil: Sørg for at stemmer er lastet
    const voices = synthRef.current.getVoices()
    if (voices.length === 0) {
      // Prøv å laste stemmer på nytt
      synthRef.current.onvoiceschanged = () => {
        lesOpp() // Prøv igjen
      }
      setFeilmelding('Laster stemmer... prøv igjen')
      return
    }

    // Bygg teksten
    const tekst = steg.map((s, i) => `Steg ${i + 1}. ${s.beskrivelse}`).join('. ')
    console.log('📖 Leser:', tekst.substring(0, 100) + '...')

    // Opprett tale-objekt
    const utterance = new SpeechSynthesisUtterance(tekst)
    utteranceRef.current = utterance

    // Innstillinger
    utterance.lang = 'nb-NO'
    utterance.rate = 0.85
    utterance.pitch = 1
    utterance.volume = 1

    // Prøv å finne norsk stemme
    const norskStemme = voices.find(v => 
      v.lang.startsWith('nb') || 
      v.lang.startsWith('no') || 
      v.lang === 'no-NO'
    )
    
    if (norskStemme) {
      utterance.voice = norskStemme
      console.log('✅ Bruker stemme:', norskStemme.name)
    } else {
      // Bruk første tilgjengelige stemme
      utterance.voice = voices[0]
      console.log('⚠️ Bruker standard stemme:', voices[0].name)
    }

    // Event handlers
    utterance.onstart = () => {
      console.log('▶️ Opplesning startet')
      setLeser(true)
      setFeilmelding('')
    }

    utterance.onend = () => {
      console.log('✅ Opplesning ferdig')
      setLeser(false)
    }

    utterance.onerror = (event) => {
      console.error('❌ Opplesningsfeil:', event)
      setLeser(false)
      
      if (event.error !== 'canceled') {
        setFeilmelding(`Feil: ${event.error}`)
        
        // Hvis feil er "language-unavailable", prøv med engelsk
        if (event.error === 'language-unavailable') {
          const fallback = new SpeechSynthesisUtterance(tekst)
          fallback.lang = 'en-US'
          fallback.rate = 0.85
          fallback.pitch = 1
          fallback.voice = voices[0] || null
          
          fallback.onend = () => setLeser(false)
          fallback.onerror = () => setLeser(false)
          
          synthRef.current?.speak(fallback)
          setLeser(true)
        }
      }
    }

    // **VIKTIG FOR MOBIL:** Start talen
    try {
      synthRef.current.speak(utterance)
      console.log('📢 Speak() kalt')
    } catch (error) {
      console.error('❌ Speak feilet:', error)
      setLeser(false)
      setFeilmelding('Kunne ikke starte opplesning')
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={lesOpp}
        disabled={!erKlar}
        className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold text-base transition-colors touch-manipulation ${
          !erKlar
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : leser
            ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
        style={{ minHeight: '56px' }}
      >
        {!erKlar ? (
          <>
            <span className="animate-pulse">⏳</span>
            <span>Laster tale...</span>
          </>
        ) : leser ? (
          <>
            <span className="text-xl">⏹️</span>
            <span>Stopp opplesning</span>
          </>
        ) : (
          <>
            <span className="text-xl">🔊</span>
            <span>Les opp alle steg ({steg.length})</span>
          </>
        )}
      </button>

      {feilmelding && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          ⚠️ {feilmelding}
        </div>
      )}

      {/* Vis antall stemmer (debug) */}
      <div className="mt-1 text-xs text-gray-400 text-center">
        {erKlar ? `✅ ${synthRef.current?.getVoices().length || 0} stemmer tilgjengelig` : '⏳ Laster stemmer...'}
      </div>
    </div>
  )
}
