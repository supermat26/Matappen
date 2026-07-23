'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getWeekStart, getOrCreateMealPlan, saveMealPlanDay } from '@/lib/mealPlanner'
import { useRouter } from 'next/navigation'

interface Props {
  oppskriftId: string
  oppskriftTittel: string
}

export default function LeggTilPlanlegger({ oppskriftId, oppskriftTittel }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  const leggTilPlanlegger = async () => {
    if (!userId) {
      // Ikke logget inn - send til login
      router.push(`/auth?redirect=/oppskrifter/${oppskriftId}`)
      return
    }

    setLoading(true)
    setError('')
    setShowSuccess(false)

    try {
      // Hent eller opprett plan for inneværende uke
      const weekStart = getWeekStart()
      const plan = await getOrCreateMealPlan(weekStart, userId)

      if (!plan?.id) {
        throw new Error('Kunne ikke opprette måltidsplan')
      }

      // Finn første ledige dag (mandag = 0)
      const existingDays = plan.days.map((d: any) => d.day_of_week)
      let ledigDag = 0
      for (let i = 0; i < 7; i++) {
        if (!existingDays.includes(i)) {
          ledigDag = i
          break
        }
      }

      // Hvis alle dager er opptatt, bruk dagens dag
      const today = new Date().getDay()
      const dagIndex = existingDays.length >= 7 ? (today === 0 ? 6 : today - 1) : ledigDag

      // Lagre oppskriften i planen
      const success = await saveMealPlanDay(
        plan.id,
        dagIndex,
        oppskriftId,
        'middag',
        ''
      )

      if (success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        throw new Error('Kunne ikke legge til i planen')
      }
    } catch (err) {
      setError((err as Error).message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={leggTilPlanlegger}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
          loading
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : showSuccess
            ? 'bg-green-600 text-white'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Legger til...</span>
          </>
        ) : showSuccess ? (
          <>
            <span>✅</span>
            <span>Lagt til i planen!</span>
          </>
        ) : (
          <>
            <span>🗓️</span>
            <span>Legg til i planlegger</span>
          </>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          ⚠️ {error}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-1">
        {userId ? 'Legges til i inneværende uke' : 'Logg inn for å bruke planlegger'}
      </div>
    </div>
  )
}