'use client'

import { useState, useEffect } from 'react'

interface Props {
  oppskriftId: string
  variant?: 'icon' | 'button'
}

export default function FavorittKnapp({ oppskriftId, variant = 'icon' }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    // Sjekk om oppskriften er i favoritter
    const favoritter = JSON.parse(localStorage.getItem('favoritter') || '[]')
    setIsFavorite(favoritter.includes(oppskriftId))
  }, [oppskriftId])

  const toggleFavorite = () => {
    const favoritter = JSON.parse(localStorage.getItem('favoritter') || '[]')
    
    if (isFavorite) {
      // Fjern fra favoritter
      const nye = favoritter.filter((id: string) => id !== oppskriftId)
      localStorage.setItem('favoritter', JSON.stringify(nye))
      setIsFavorite(false)
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 2000)
    } else {
      // Legg til i favoritter
      favoritter.push(oppskriftId)
      localStorage.setItem('favoritter', JSON.stringify(favoritter))
      setIsFavorite(true)
      setShowFeedback(true)
      setTimeout(() => setShowFeedback(false), 2000)
    }
  }

  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
            isFavorite
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isFavorite ? '❤️' : '🤍'}
          <span>{isFavorite ? 'I favoritter' : 'Legg til favoritt'}</span>
        </button>
        {showFeedback && (
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded">
            {isFavorite ? '✅ Lagt til!' : '🗑️ Fjernet!'}
          </span>
        )}
      </div>
    )
  }

  // Icon variant (for bruk ved tittelen)
  return (
    <button
      onClick={toggleFavorite}
      className="text-4xl hover:scale-110 transition-transform active:scale-95"
      aria-label={isFavorite ? 'Fjern fra favoritter' : 'Legg til i favoritter'}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  )
}