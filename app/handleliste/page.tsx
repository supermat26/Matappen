'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HandlelisteItem {
  id: string
  navn: string
  mengde: string
}

export default function HandlelistePage() {
  const [items, setItems] = useState<HandlelisteItem[]>([])

  // Last handlelisten fra localStorage
  useEffect(() => {
    const saved = localStorage.getItem('handleliste')
    if (saved) {
      setItems(JSON.parse(saved))
    }
  }, [])

  // Lagre handlelisten til localStorage
  useEffect(() => {
    localStorage.setItem('handleliste', JSON.stringify(items))
  }, [items])

  // Fjern et item
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Tøm handlelisten
  const clearList = () => {
    if (confirm('Vil du tømme hele handlelisten?')) {
      setItems([])
    }
  }

  // Kopier handlelisten til utklippstavlen
  const copyList = () => {
    const tekst = items.map(item => `${item.navn} - ${item.mengde}`).join('\n')
    navigator.clipboard.writeText(tekst)
    alert('✅ Handlelisten er kopiert!')
  }

  // Send til REMA 1000 (åpner REMA-appen hvis installert)
  const openREMA = () => {
    const tekst = items.map(item => `${item.navn} ${item.mengde}`).join(',')
    // REMA 1000 app deep link (hvis de har en)
    const remaUrl = `rema1000://handleliste?items=${encodeURIComponent(tekst)}`
    
    // Prøv å åpne appen
    window.location.href = remaUrl
    
    // Fallback: hvis appen ikke er installert, kopier listen
    setTimeout(() => {
      copyList()
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🛒 Handleliste
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600 text-lg">Handlelisten er tom</p>
          <p className="text-gray-500 mt-2">
            Legg til ingredienser fra oppskrifter!
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Se oppskrifter
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
              <span className="text-gray-600">
                {items.length} varer i handlelisten
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openREMA}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                >
                  🏪 REMA 1000
                </button>
                <button
                  onClick={copyList}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  📋 Kopier
                </button>
                <button
                  onClick={clearList}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                >
                  🗑️ Tøm
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center border-b border-gray-100 py-2"
                >
                  <div>
                    <span className="font-medium text-gray-800">
                      {item.navn}
                    </span>
                    <span className="text-gray-500 ml-2">{item.mengde}</span>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              💡 Handle tips:
            </h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>1. Klikk &quot;REMA 1000&quot; for å åpne appen (hvis installert)</li>
              <li>2. Klikk &quot;Kopier&quot; for å lime inn i hvilken som helst handleliste-app</li>
              <li>3. Bruk listen som sjekkliste i butikken</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
