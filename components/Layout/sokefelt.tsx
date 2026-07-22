'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Sokefelt() {
  const [sok, setSok] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sok.trim()) {
      router.push(`/sok?q=${encodeURIComponent(sok)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={sok}
        onChange={(e) => setSok(e.target.value)}
        placeholder="Søk etter oppskrifter..."
        className="w-48 md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      <button
        type="submit"
        className="absolute right-2 top-2 text-gray-500"
      >
        🔍
      </button>
    </form>
  )
}