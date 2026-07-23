import { supabase } from './supabaseClient'
import type { Oppskrift } from './oppskrifter'

export interface MealPlanDay {
  id?: string
  day_of_week: number
  oppskrift_id: string | null
  meal_type: string
  notes?: string
  oppskrift?: Oppskrift
}

export interface MealPlan {
  id?: string
  week_start: string
  days: MealPlanDay[]
}

// Hent uke-start (mandag)
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

// Hent uke-dager (mandag-søndag)
export function getWeekDays(weekStart: string): Date[] {
  const start = new Date(weekStart)
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

// Hent dagens navn
export const DAY_NAMES = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

// Hent forkortede navn
export const DAY_NAMES_SHORT = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

// Hent eller opprett en måltidsplan for en gitt uke
export async function getOrCreateMealPlan(weekStart: string, userId: string): Promise<MealPlan | null> {
  // Sjekk om planen finnes
  const { data: existing, error: fetchError } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (fetchError) {
    console.error('Feil ved henting av meal plan:', fetchError)
    return null
  }

  let planId: string

  if (existing) {
    planId = existing.id
  } else {
    // Opprett ny plan
    const { data: newPlan, error: createError } = await supabase
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start: weekStart
      })
      .select()
      .single()

    if (createError || !newPlan) {
      console.error('Feil ved oppretting av meal plan:', createError)
      return null
    }

    planId = newPlan.id
  }

  // Hent dager for planen
  const { data: days, error: daysError } = await supabase
    .from('meal_plan_days')
    .select('*, oppskrifter(*)')
    .eq('meal_plan_id', planId)
    .order('day_of_week', { ascending: true })

  if (daysError) {
    console.error('Feil ved henting av meal plan days:', daysError)
    return null
  }

  return {
    id: planId,
    week_start: weekStart,
    days: days.map((d: any) => ({
      id: d.id,
      day_of_week: d.day_of_week,
      oppskrift_id: d.oppskrift_id,
      meal_type: d.meal_type,
      notes: d.notes,
      oppskrift: d.oppskrifter
    }))
  }
}

// Lagre en dag i måltidsplanen
export async function saveMealPlanDay(
  mealPlanId: string,
  dayOfWeek: number,
  oppskriftId: string | null,
  mealType: string = 'middag',
  notes: string = ''
): Promise<boolean> {
  // Sjekk om dagen allerede finnes
  const { data: existing, error: checkError } = await supabase
    .from('meal_plan_days')
    .select('id')
    .eq('meal_plan_id', mealPlanId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)
    .maybeSingle()

  if (checkError) {
    console.error('Feil ved sjekk av meal plan day:', checkError)
    return false
  }

  if (existing) {
    // Oppdater eksisterende
    if (oppskriftId === null) {
      // Slett hvis fjernet
      const { error: deleteError } = await supabase
        .from('meal_plan_days')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        console.error('Feil ved sletting av meal plan day:', deleteError)
        return false
      }
      return true
    }

    const { error: updateError } = await supabase
      .from('meal_plan_days')
      .update({
        oppskrift_id: oppskriftId,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Feil ved oppdatering av meal plan day:', updateError)
      return false
    }
    return true
  }

  // Opprett ny
  const { error: insertError } = await supabase
    .from('meal_plan_days')
    .insert({
      meal_plan_id: mealPlanId,
      day_of_week: dayOfWeek,
      oppskrift_id: oppskriftId,
      meal_type: mealType,
      notes: notes
    })

  if (insertError) {
    console.error('Feil ved oppretting av meal plan day:', insertError)
    return false
  }

  return true
}

// Hent alle ingredienser fra en måltidsplan
export async function getIngredientsFromMealPlan(mealPlanId: string): Promise<any[]> {
  // Hent alle oppskrifts-IDer fra planen
  const { data: days, error: daysError } = await supabase
    .from('meal_plan_days')
    .select('oppskrift_id')
    .eq('meal_plan_id', mealPlanId)
    .not('oppskrift_id', 'is', null)

  if (daysError || !days || days.length === 0) {
    return []
  }

  const oppskriftIds = days.map(d => d.oppskrift_id).filter(id => id !== null)

  if (oppskriftIds.length === 0) {
    return []
  }

  // Hent alle ingredienser for disse oppskriftene
  const { data: ingredients, error: ingredientsError } = await supabase
    .from('ingredienser')
    .select('*, oppskrifter(tittel)')
    .in('oppskrift_id', oppskriftIds)

  if (ingredientsError) {
    console.error('Feil ved henting av ingredienser:', ingredientsError)
    return []
  }

  // Grupper ingredienser for å unngå duplikater
  const grouped = ingredients.reduce((acc: any, curr: any) => {
    const key = curr.navn
    if (!acc[key]) {
      acc[key] = {
        navn: curr.navn,
        mengde: curr.mengde,
        oppskrifter: [curr.oppskrifter?.tittel]
      }
    } else {
      if (!acc[key].oppskrifter.includes(curr.oppskrifter?.tittel)) {
        acc[key].oppskrifter.push(curr.oppskrifter?.tittel)
      }
    }
    return acc
  }, {})

  return Object.values(grouped)
}
