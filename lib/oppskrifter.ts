import { supabase } from './supabaseClient'

// Hent alle oppskrifter
export async function getOppskrifter() {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Feil ved henting av oppskrifter:', error)
    return []
  }

  return data || []
}

// Hent oppskrifter etter kategori
export async function getOppskrifterByKategori(kategori: string) {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('*')
    .eq('kategori', kategori)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Feil ved henting av oppskrifter for kategori:', error)
    return []
  }

  return data || []
}

// Hent én oppskrift med ingredienser og steg
export async function getOppskrift(id: string) {
  // Hent oppskriften
  const { data: oppskrift, error: oppskriftError } = await supabase
    .from('oppskrifter')
    .select('*')
    .eq('id', id)
    .single()

  if (oppskriftError || !oppskrift) {
    console.error('Feil ved henting av oppskrift:', oppskriftError)
    return null
  }

  // Hent ingredienser
  const { data: ingredienser, error: ingrediensError } = await supabase
    .from('ingredienser')
    .select('*')
    .eq('oppskrift_id', id)
    .order('rekkefolge', { ascending: true })

  if (ingrediensError) {
    console.error('Feil ved henting av ingredienser:', ingrediensError)
  }

  // Hent steg
  const { data: steg, error: stegError } = await supabase
    .from('steg')
    .select('*')
    .eq('oppskrift_id', id)
    .order('rekkefolge', { ascending: true })

  if (stegError) {
    console.error('Feil ved henting av steg:', stegError)
  }

  return {
    ...oppskrift,
    ingredienser: ingredienser || [],
    steg: steg || []
  }
}

// Hent alle kategorier (unike)
export async function getKategorier() {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('kategori')

  if (error) {
    console.error('Feil ved henting av kategorier:', error)
    return []
  }

  // Fjern duplikater
  const kategorier = [...new Set(data.map(item => item.kategori))]
  return kategorier
}