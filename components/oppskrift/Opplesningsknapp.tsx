'use client'

import { useState, useEffect, useRef } from 'react'
import type { Steg } from '@/lib/oppskrifter'

interface Props {
  steg: Steg[]
}

export default function Opplesningsknapp({ steg }: Props) {
  const [leser, setLeser] = useState(false)
  const [stotte, setStotte] = useState<boolean | null>(null)
  const [feilmelding, setFeilmelding] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialiser speech synthesis
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Sjekk støtte
    if (!('speechSynthesis' in window)) {
      setStotte(false)
      setFeilmelding('Nettleseren støtter ikke tale')
      return
    }

    setStotte(true)
    synthRef.current = window.speechSynthesis

    // FORCE LAST VOICES - viktig for mobil!
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log('📢 Tilgjengelige stemmer:', voices.length)
      
      // Sjekk om vi har norsk stemme
      const norsk = voices.find(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
      if (norsk) {
        console.log('✅ Norsk stemme funnet:', norsk.name)
      } else {
        console.log('⚠️ Ingen norsk stemme, bruker standard')
      }
    }

    // Prøv å laste stemmer med en gang
    loadVoices()

    // Hvis ingen stemmer, vent på at de lastes
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
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
    if (!stotte || !synthRef.current) {
      alert('Nettleseren støtter ikke opplesning. Bruk Chrome på mobil.')
      return
    }

    // Hvis allerede leser, stopp
    if (leser) {
      synthRef.current.cancel()
      setLeser(false)
      setCurrentStep(0)
      return
    }

    // Sjekk at det er noe å lese
    if (!steg || steg.length === 0) {
      setFeilmelding('Ingen steg å lese')
      return
    }

    // Bygg teksten med tydelige pauser
    const tekst = steg.map((s, i) => 
      `Steg ${i + 1}. ${s.beskrivelse}`
    ).join('. ')

    console.log('📖 Leser:', tekst.substring(0, 100) + '...')

    // Opprett tale-objekt
    const utterance = new SpeechSynthesisUtterance(tekst)
    utteranceRef.current = utterance

    // Viktigste innstillinger for mobil
    utterance.lang = 'nb-NO'
    utterance.rate = 0.85  // Litt langsommere
    utterance.pitch = 1
    utterance.volume = 1

    // Prøv å finne norsk stemme - VIKTIG for mobil!
    const voices = synthRef.current.getVoices()
    const norskStemme = voices.find(v => 
      v.lang.startsWith('nb') || 
      v.lang.startsWith('no') || 
      v.lang === 'no-NO'
    )
    
    if (norskStemme) {
      utterance.voice = norskStemme
      console.log('✅ Bruker stemme:', norskStemme.name)
    } else {
      console.log('⚠️ Bruker standard stemme (ikke norsk)')
      // Prøv å finne en kvinnelig stemme (ofte bedre på mobil)
      const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female'))
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }
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
      setCurrentStep(0)
    }

    utterance.onerror = (event) => {
      console.error('❌ Opplesningsfeil:', event)
      setLeser(false)
      setCurrentStep(0)
      
      // Hvis det er en feil, prøv igjen med norsk språk
      if (event.error === 'language-unavailable') {
        setFeilmelding('Norsk språk ikke tilgjengelig, prøver engelsk...')
        // Prøv med engelsk som fallback
        const fallback = new SpeechSynthesisUtterance(tekst)
        fallback.lang = 'en-US'
        fallback.rate = 0.85
        fallback.pitch = 1
        
        fallback.onend = () => {
          setLeser(false)
          setCurrentStep(0)
        }
        
        synthRef.current?.speak(fallback)
        setLeser(true)
        return
      }
      
      if (event.error !== 'canceled') {
        setFeilmelding(`Feil: ${event.error}`)
      }
    }

    // Forsøk å snakke
    try {
      synthRef.current.speak(utterance)
    } catch (error) {
      console.error('❌ Speak feilet:', error)
      setLeser(false)
      setFeilmelding('Kunne ikke starte opplesning')
    }
  }

  // Hvis stotte er null (laster)
  if (stotte === null) {
    return (
      <div className="text-sm text-gray-500 bg-gray-100 px-4 py-3 rounded-lg text-center">
        ⏳ Laster tale...
      </div>
    )
  }

  // Hvis nettleseren ikke støtter opplesning
  if (!stotte) {
    return (
      <div className="text-sm text-gray-500 bg-gray-100 px-4 py-3 rounded-lg text-center">
        🔇 Opplesning ikke støttet
      </div>
    )
  }

  return (
    <div className="w-full">
      <button
        onClick={lesOpp}
        className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold text-base transition-colors touch-manipulation ${
          leser
            ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
        }`}
        style={{ minHeight: '56px' }}  // God touch target
      >
        {leser ? (
          <>
            <span className="text-xl">⏹️</span> 
            <span>Stopp opplesning</span>
            <span className="text-xs opacity-75 ml-2">
              ({steg.length} steg)
            </span>
          </>
        ) : (
          <>
            <span className="text-xl">🔊</span> 
            <span>Les opp alle steg</span>
            <span className="text-xs opacity-75 ml-2">
              ({steg.length} steg)
            </span>
          </>
        )}
      </button>

      {/* Progress - viser hvilket steg som leses */}
      {leser && steg.length > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Leser steg {currentStep + 1} av {steg.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steg.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Feilmelding */}
      {feilmelding && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          ⚠️ {feilmelding}
        </div>
      )}
    </div>
  )
}