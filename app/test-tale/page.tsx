'use client'

import { useState, useEffect } from 'react'

export default function TestTalePage() {
  const [status, setStatus] = useState('Sjekker...')
  const [stemmer, setStemmer] = useState<any[]>([])
  const [tekst, setTekst] = useState('Dette er en test av norsk tale på mobilen.')
  const [sisteFeil, setSisteFeil] = useState('')

  // Sjekk støtte ved lasting
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Sjekk om speech synthesis støttes
    if (!('speechSynthesis' in window)) {
      setStatus('❌ Speech synthesis støttes ikke i denne nettleseren')
      return
    }

    setStatus('✅ Speech synthesis støttes')

    // Hent stemmer
    const hentStemmer = () => {
      const voices = window.speechSynthesis.getVoices()
      setStemmer(voices)
      
      const norske = voices.filter(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
      if (norske.length > 0) {
        setStatus(`✅ Fant ${norske.length} norske stemmer: ${norske.map(v => v.name).join(', ')}`)
      } else if (voices.length > 0) {
        setStatus(`⚠️ Fant ${voices.length} stemmer, men ingen norske. Bruker standard.`)
      } else {
        setStatus('⏳ Ingen stemmer lastet ennå. Trykk "Hent stemmer".')
      }
    }

    // Prøv å hente stemmer med en gang
    hentStemmer()

    // Sett opp event listener for når stemmer lastes
    window.speechSynthesis.onvoiceschanged = () => {
      hentStemmer()
    }

    // Rydd opp
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const hentStemmer = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    setStemmer(voices)
    
    const norske = voices.filter(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
    if (norske.length > 0) {
      setStatus(`✅ Fant ${norske.length} norske stemmer`)
    } else {
      setStatus(`⚠️ ${voices.length} stemmer funnet, ingen norske`)
    }
  }

  const testTale = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis støttes ikke')
      return
    }

    const synth = window.speechSynthesis
    
    // Stopp eventuell pågående tale
    synth.cancel()
    
    setSisteFeil('')
    
    try {
      const utterance = new SpeechSynthesisUtterance(tekst)
      utterance.lang = 'nb-NO'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      // Prøv å finne norsk stemme
      const voices = synth.getVoices()
      const norskStemme = voices.find(v => v.lang.startsWith('nb') || v.lang.startsWith('no'))
      if (norskStemme) {
        utterance.voice = norskStemme
        console.log('✅ Bruker norsk stemme:', norskStemme.name)
      } else if (voices.length > 0) {
        // Bruk første stemme hvis ingen norsk
        utterance.voice = voices[0]
        console.log('⚠️ Bruker standard stemme:', voices[0].name)
      }

      // Event handlers
      utterance.onstart = () => {
        console.log('▶️ Opplesning startet')
        setStatus('🔊 Leser...')
      }

      utterance.onend = () => {
        console.log('✅ Opplesning ferdig')
        setStatus('✅ Ferdig!')
      }

      utterance.onerror = (event) => {
        console.error('❌ Feil:', event)
        setSisteFeil(`Feil: ${event.error}`)
        setStatus(`❌ Feil: ${event.error}`)
      }

      // Start opplesning
      synth.speak(utterance)
      console.log('📢 Speak() kalt')

    } catch (error) {
      console.error('❌ Unntak:', error)
      setSisteFeil(`Unntak: ${error}`)
      setStatus('❌ Kunne ikke starte opplesning')
    }
  }

  const testEnkel = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    const synth = window.speechSynthesis
    synth.cancel()
    
    // Enkel test uten norsk stemme
    const msg = new SpeechSynthesisUtterance('Hello world, this is a test')
    msg.lang = 'en-US'
    msg.rate = 1
    
    msg.onend = () => console.log('✅ Enkel test ferdig')
    msg.onerror = (e) => console.error('❌ Enkel test feil:', e)
    
    synth.speak(msg)
    setStatus('🔊 Sier "Hello world" på engelsk')
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎙️ Test opplesning</h1>
      
      {/* Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">Status:</h2>
        <p className="text-lg">{status}</p>
        {sisteFeil && (
          <p className="text-red-600 text-sm mt-2">❌ {sisteFeil}</p>
        )}
      </div>

      {/* Stemmer */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Tilgjengelige stemmer ({stemmer.length})</h2>
          <button
            onClick={hentStemmer}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            🔄 Hent stemmer
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto text-sm">
          {stemmer.length === 0 ? (
            <p className="text-gray-500">Ingen stemmer lastet. Trykk "Hent stemmer".</p>
          ) : (
            <ul className="space-y-1">
              {stemmer.map((v, i) => (
                <li key={i} className="border-b pb-1">
                  {v.name} ({v.lang}) {v.lang.startsWith('nb') || v.lang.startsWith('no') ? '🇳🇴' : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Testtekst */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h2 className="font-semibold mb-2">Tekst som skal leses:</h2>
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          className="w-full border rounded p-2 text-base"
          rows={3}
        />
      </div>

      {/* Knapper */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={testTale}
          className="bg-green-600 text-white px-6 py-4 rounded-xl text-lg font-semibold touch-manipulation"
          style={{ minHeight: '56px' }}
        >
          🇳🇴 Les norsk
        </button>
        <button
          onClick={testEnkel}
          className="bg-blue-600 text-white px-6 py-4 rounded-xl text-lg font-semibold touch-manipulation"
          style={{ minHeight: '56px' }}
        >
          🇬🇧 Test engelsk
        </button>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h3 className="font-bold text-yellow-800">💡 Tips for mobil:</h3>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
          <li>• Sjekk at lyden er på (ikke lydløs modus)</li>
          <li>• Prøv med headset</li>
          <li>• Bruk Chrome på mobil</li>
          <li>• Sjekk at volumet er oppe</li>
          <li>• Prøv "Test engelsk" - hvis den fungerer, er det norske stemmer som mangler</li>
        </ul>
      </div>

      {/* Instruksjoner for å installere norske stemmer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h3 className="font-bold text-blue-800">📱 Installer norske stemmer på mobil:</h3>
        <div className="text-sm text-blue-700 mt-2 space-y-2">
          <p><strong>Android:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gå til Innstillinger → System → Språk og inndata → Taleinndata</li>
            <li>Trykk på "Tekst-til-tale"</li>
            <li>Velg "Språk" og last ned norsk</li>
          </ul>
          <p><strong>iPhone:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gå til Innstillinger → Tilgjengelighet → Tale</li>
            <li>Slå på "Les opp innhold"</li>
            <li>Last ned norske stemmer under "Språk"</li>
          </ul>
        </div>
      </div>

      {/* Console log */}
      <details className="mt-4">
        <summary className="cursor-pointer text-blue-600">🔍 Åpne konsoll for debugging</summary>
        <div className="bg-gray-900 text-green-400 p-4 rounded mt-2 text-xs overflow-auto max-h-48">
          Åpne utviklerverktøy (F12) og se Console-fanen for logg-meldinger.
        </div>
      </details>
    </div>
  )
}
