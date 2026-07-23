'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  getWeekStart, 
  getWeekDays, 
  DAY_NAMES, 
  DAY_NAMES_SHORT,
  getOrCreateMealPlan,
  saveMealPlanDay,
  getIngredientsFromMealPlan
} from '@/lib/mealPlanner'
import type { MealPlanDay } from '@/lib/mealPlanner'
import type { Oppskrift } from '@/lib/oppskrifter'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================
// MODAL: Velg oppskrift
// ============================================
function VelgOppskriftModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentOppskriftId 
}: { 
  isOpen: boolean
  onClose: () => void
  onSelect: (id: string | null) => void
  currentOppskriftId: string | null
}) {
  const [oppskrifter, setOppskrifter] = useState<Oppskrift[]>([])
  const [sok, setSok] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      hentOppskrifter()
    }
  }, [isOpen])

  const hentOppskrifter = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('oppskrifter')
      .select('*')
      .order('tittel', { ascending: true })

    if (!error && data) {
      setOppskrifter(data)
    }
    setLoading(false)
  }

  const filtered = oppskrifter.filter(o =>
    o.tittel.toLowerCase().includes(sok.toLowerCase()) ||
    o.kategori.toLowerCase().includes(sok.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Velg oppskrift</h2>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>
        
        <div className="p-4">
          <input
            type="text"
            placeholder="Søk etter oppskrift..."
            value={sok}
            onChange={(e) => setSok(e.target.value)}
            className="w-full p-3 border rounded-lg text-base"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500">Laster oppskrifter...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500">Fant ingen oppskrifter</p>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => { onSelect(null); onClose() }}
                className="w-full text-left p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-red-500 transition-colors text-gray-500"
              >
                🗑️ Fjern måltid
              </button>
              {filtered.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => { onSelect(opp.id); onClose() }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    opp.id === currentOppskriftId
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{opp.tittel}</div>
                      <div className="text-sm text-gray-500 capitalize">{opp.kategori}</div>
                    </div>
                    <div className="text-sm text-gray-400">⏱ {opp.prep_time || 30} min</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MODAL: Bekreft fjerning
// ============================================
function FjernBekreftModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  oppskriftTittel 
}: { 
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  oppskriftTittel: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">🗑️ Fjern måltid</h2>
        <p className="text-gray-600 mb-6">
          Er du sikker på at du vil fjerne <strong>{oppskriftTittel}</strong> fra planen?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Ja, fjern
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// HOVEDKOMPONENT
// ============================================
export default function MatplanleggerPage() {
  const [selectedDay, setSelectedDay] = useState<{ index: number; type: string } | null>(null)
  const [showRemoveModal, setShowRemoveModal] = useState<{ index: number; tittel: string } | null>(null)
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState<string>(getWeekStart())
  const [generatingList, setGeneratingList] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // ============================================
  // SJEKK AUTH
  // ============================================
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth?redirect=/matplanlegger')
        return
      }
      
      setUserId(user.id)
    }

    checkAuth()
  }, [router])

  // ============================================
  // LAST PLAN
  // ============================================
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadPlan = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getOrCreateMealPlan(weekStart, userId)
        if (data) {
          setPlan(data)
        } else {
          setError('Kunne ikke hente måltidsplan. Sørg for at databasen er satt opp.')
        }
      } catch (err) {
        setError('Feil ved lasting av måltidsplan: ' + (err as Error).message)
      }
      setLoading(false)
    }

    loadPlan()
  }, [userId, weekStart])

  // ============================================
  // HENT UKEDAGER
  // ============================================
  const weekDays = getWeekDays(weekStart)

  const forrigeUke = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const nesteUke = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const idag = () => {
    setWeekStart(getWeekStart())
  }

  const getDayOppskrift = (dayIndex: number): MealPlanDay | undefined => {
    return plan?.days?.find((d: any) => d.day_of_week === dayIndex)
  }

  // ============================================
  // HÅNDTER KLIKK PÅ DAG
  // ============================================
  const handleDayClick = (dayIndex: number) => {
    const day = getDayOppskrift(dayIndex)
    
    // Hvis dagen har en oppskrift → åpne modal med valg
    if (day?.oppskrift_id && day?.oppskrift) {
      // Vis en liten meny: gå til oppskrift eller fjern
      const valg = confirm(
        `"${day.oppskrift.tittel}" er lagt til denne dagen.\n\n` +
        `Trykk "OK" for å gå til oppskriften\n` +
        `Trykk "Avbryt" for å fjerne den fra planen`
      )
      
      if (valg) {
        // OK → gå til oppskriften
        router.push(`/oppskrifter/${day.oppskrift_id}`)
      } else {
        // Avbryt → åpne bekreftelsesmodal for fjerning
        setShowRemoveModal({
          index: dayIndex,
          tittel: day.oppskrift.tittel
        })
      }
    } else {
      // Hvis ingen oppskrift → åpne modal for å velge
      setSelectedDay({ index: dayIndex, type: 'middag' })
    }
  }

  // ============================================
  // LAGRE DAG
  // ============================================
  const handleSaveDay = async (dayIndex: number, oppskriftId: string | null) => {
    if (!plan?.id || !userId) return

    const success = await saveMealPlanDay(plan.id, dayIndex, oppskriftId, 'middag', '')
    if (success) {
      const data = await getOrCreateMealPlan(weekStart, userId)
      setPlan(data)
    }
  }

  // ============================================
  // FJERN OPPPSKRIFT FRA DAG
  // ============================================
  const handleRemoveDay = async (dayIndex: number) => {
    if (!plan?.id || !userId) return

    const success = await saveMealPlanDay(plan.id, dayIndex, null, 'middag', '')
    if (success) {
      const data = await getOrCreateMealPlan(weekStart, userId)
      setPlan(data)
    }
    setShowRemoveModal(null)
  }

  // ============================================
  // GENERER HANDLELISTE
  // ============================================
  const genererHandleliste = async () => {
    if (!plan?.id) return

    setGeneratingList(true)
    try {
      const ingredients = await getIngredientsFromMealPlan(plan.id)
      
      if (ingredients.length === 0) {
        alert('Ingen ingredienser å legge til. Legg til oppskrifter i planen først!')
        setGeneratingList(false)
        return
      }

      const eksisterende = JSON.parse(localStorage.getItem('handleliste') || '[]')
      
      const nye = ingredients.map((ing: any) => ({
        id: `${ing.navn}-${Date.now()}`,
        navn: ing.navn,
        mengde: ing.mengde
      }))

      const alle = [...eksisterende]
      nye.forEach((item: any) => {
        if (!alle.some((e: any) => e.navn === item.navn)) {
          alle.push(item)
        }
      })

      localStorage.setItem('handleliste', JSON.stringify(alle))
      alert(`✅ ${nye.length} ingredienser lagt til i handlelisten!`)
    } catch (err) {
      alert('Kunne ikke generere handleliste: ' + (err as Error).message)
    }
    setGeneratingList(false)
  }

  // ============================================
  // SJEKK OM DAG ER I DAG
  // ============================================
  const erIdag = (date: Date) => {
    const iDag = new Date()
    return date.getDate() === iDag.getDate() &&
      date.getMonth() === iDag.getMonth() &&
      date.getFullYear() === iDag.getFullYear()
  }

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Laster måltidsplan...</p>
      </div>
    )
  }

  // ============================================
  // RENDER: FEIL
  // ============================================
  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-red-700 mb-2">Noe gikk galt</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600">
          Husk å kjøre SQL for meal_plans og meal_plan_days i Supabase.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Prøv igjen
        </button>
      </div>
    )
  }

  // ============================================
  // RENDER: IKKE LOGGET INN
  // ============================================
  if (!userId) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-4">Logg inn for å planlegge måltider</h1>
        <p className="text-gray-600 mb-6">Du må være innlogget for å bruke måltidsplanleggeren</p>
        <Link
          href="/auth?redirect=/matplanlegger"
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Logg inn
        </Link>
      </div>
    )
  }

  // ============================================
  // RENDER: HOVEDINNHOLD
  // ============================================
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">🗓️ Måltidsplanlegger</h1>
        <button
          onClick={genererHandleliste}
          disabled={generatingList}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
        >
          {generatingList ? '⏳ Genererer...' : '🛒 Generer handleliste'}
        </button>
      </div>

      {/* Uke-navigasjon */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm mb-6">
        <button onClick={forrigeUke} className="text-2xl p-2 hover:bg-gray-100 rounded">‹</button>
        <div className="flex items-center gap-4">
          <span className="font-semibold">
            Uke {new Date(weekStart).getWeekNumber()}
          </span>
          <button onClick={idag} className="text-sm text-blue-600 hover:underline">I dag</button>
        </div>
        <button onClick={nesteUke} className="text-2xl p-2 hover:bg-gray-100 rounded">›</button>
      </div>

      {/* Dagnavn */}
      <div className="grid grid-cols-7 gap-2">
        {DAY_NAMES_SHORT.map((navn, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
            {navn}
          </div>
        ))}
      </div>

      {/* Uke-grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const day = getDayOppskrift(index)
          const oppskrift = day?.oppskrift
          const isToday = erIdag(date)
          const hasOppskrift = !!oppskrift

          return (
            <div
              key={index}
              className={`bg-white rounded-xl p-2 shadow-sm border-2 ${
                isToday ? 'border-red-500' : 'border-transparent'
              } hover:shadow-md transition-shadow`}
            >
              <div className="text-center mb-2">
                <span className={`text-sm font-medium ${isToday ? 'text-red-600' : 'text-gray-700'}`}>
                  {date.getDate()}
                </span>
              </div>

              {/* Dag-knapp */}
              <button
                onClick={() => handleDayClick(index)}
                className={`w-full text-left min-h-[60px] p-1 rounded-lg border-2 transition-colors ${
                  hasOppskrift
                    ? 'border-green-400 bg-green-50 hover:bg-green-100 hover:border-green-600'
                    : 'border-dashed border-gray-200 hover:border-red-400'
                }`}
              >
                {hasOppskrift ? (
                  <div className="text-center">
                    <div className="text-xs leading-tight font-medium text-gray-800 line-clamp-2">
                      {oppskrift.tittel}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">⏱ {oppskrift.prep_time || 30} min</div>
                    <div className="text-xs text-green-600 mt-1">👆 Klikk for valg</div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-xs flex items-center justify-center h-full">
                    <span>+ Legg til</span>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal for å velge oppskrift */}
      {selectedDay && (
        <VelgOppskriftModal
          isOpen={!!selectedDay}
          onClose={() => setSelectedDay(null)}
          onSelect={(id) => {
            if (selectedDay) {
              handleSaveDay(selectedDay.index, id)
            }
            setSelectedDay(null)
          }}
          currentOppskriftId={getDayOppskrift(selectedDay.index)?.oppskrift_id || null}
        />
      )}

      {/* Modal for å bekrefte fjerning */}
      {showRemoveModal && (
        <FjernBekreftModal
          isOpen={!!showRemoveModal}
          onClose={() => setShowRemoveModal(null)}
          onConfirm={() => {
            if (showRemoveModal) {
              handleRemoveDay(showRemoveModal.index)
            }
          }}
          oppskriftTittel={showRemoveModal.tittel}
        />
      )}

      {/* Tips-boks */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Slik bruker du planleggeren:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Klikk på en tom dag</strong> for å velge en oppskrift</li>
          <li>• <strong>Klikk på en dag med oppskrift</strong> → velg å gå til oppskriften eller fjerne den</li>
          <li>• <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-1"></span> Grønn farge = oppskrift lagt til</li>
          <li>• Trykk <strong>"Generer handleliste"</strong> for å få alle ingredienser</li>
          <li>• Rød ramme markerer <strong>dagens dato</strong></li>
        </ul>
      </div>

      {/* Status og ukeplan */}
      <div className="mt-4 flex flex-wrap justify-between items-center text-xs text-gray-400 gap-2">
        <span>
          Planlagte måltider: {plan?.days?.filter((d: any) => d.oppskrift_id).length || 0} av 7
        </span>
        <button
          onClick={() => {
            const dager = weekDays.map((date, i) => {
              const day = getDayOppskrift(i)
              return day?.oppskrift?.tittel || 'Ingen'
            })
            alert(`Ukeplan:\n${dager.map((d, i) => `${DAY_NAMES[i]}: ${d}`).join('\n')}`)
          }}
          className="text-blue-500 hover:underline"
        >
          Vis ukeplan
        </button>
      </div>
    </div>
  )
}

// ============================================
// HELPEFUNKSJON: UKENUMMER
// ============================================
declare global {
  interface Date {
    getWeekNumber(): number
  }
}

Date.prototype.getWeekNumber = function() {
  const d = new Date(this)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}