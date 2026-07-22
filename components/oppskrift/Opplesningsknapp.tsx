'use client'

import { useState, useEffect } from 'react'
import type { Steg } from '@/lib/oppskrifter'

interface Props {
  steg: Steg[]
}

export default function Opplesningsknapp({ steg }: Props) {
  const [leser, setLeser] = useState(false)
  const [stotte, setStotte] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Sjekk om nettleseren støtter speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setStotte(false)
    }
  }, [])

  const lesOpp = () => {
    if (!stotte) {
      alert('Din nettleser støtter ikke opplesning. Prøv Chrome, Edge eller Safari.')
      return
    }

    const speechSynth = window.speechSynthesis

    if (leser) {
      speechSynth.cancel()
      setLeser(false)
      setCurrentStep(0)
      return
    }

    setLeser(true)
    setCurrentStep(0)

    // Sett sammen all tekst
    const fullTekst = steg.map((s, i) => `Steg ${i + 1}: ${s.beskrivelse}`).join('. ')

    // Opprett tale-objekt
    const utterance = new SpeechSynthesisUtterance(fullTekst)
    utterance.lang = 'nb-NO'  // Norsk bokmål
    utterance.rate = 0.85      // Litt langsommere for bedre forståelse
    utterance.pitch = 1

    // Oppdater currentStep mens den leser
    const words = fullTekst.split(' ')
    let wordCount = 0
    
    const updateStep = () => {
      // Finn hvilket steg vi er på basert på antall ord lest
      const stepIndex = Math.min(
        Math.floor(wordCount / (words.length / steg.length)),
        steg.length - 1
      )
      setCurrentStep(stepIndex)
    }

    // Intervall for å oppdatere steg-indikator
    const interval = setInterval(() => {
      if (speechSynth.speaking) {
        wordCount += 2
        updateStep()
      }
    }, 500)

    utterance.onend = () => {
      setLeser(false)
      setCurrentStep(0)
      clearInterval(interval)
    }

    utterance.onerror = (event) => {
      console.error('Opplesningsfeil:', event)
      setLeser(false)
      setCurrentStep(0)
      clearInterval(interval)
      // Hvis feilen er "canceled", er det fordi brukeren stoppet
      if (event.error !== 'canceled') {
        alert('Det oppstod en feil under opplesning. Prøv igjen.')
      }
    }

    speechSynth.speak(utterance)
  }

  // Hvis nettleseren ikke støtter opplesning
  if (!stotte) {
    return (
      <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
        🔇 Opplesning ikke støttet i denne nettleseren
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
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

      {/* Vis hvilket steg som leses */}
      {leser && (
        <div className="text-sm text-gray-600">
          Leser steg {currentStep + 1} av {steg.length}
        </div>
      )}
    </div>
  )
}
