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
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">
                {items.length} varer i handlelisten
              </span>
              <div className="flex gap-2">
                <button
                  onClick={copyList}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  📋 Kopier
                </button>
                <button
                  onClick={clearList}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
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
                    className="text-red-500 hover:text-red-700"
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
            <p className="text-blue-700 text-sm">
              1. Kopier listen og lim inn i REMA 1000-appen
              <br />
              2. Eller bruk listen som sjekkliste i butikken
            </p>
          </div>
        </>
      )}
    </div>
  )
}
