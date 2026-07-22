import { supabase } from './supabaseClient'

// Definere typer
export interface Ingrediens {
  id: string
  oppskrift_id: string
  navn: string
  mengde: string
  rekkefolge: number
}

export interface Steg {
  id: string
  oppskrift_id: string
  beskrivelse: string
  bilde_url: string | null
  rekkefolge: number
}

export interface Oppskrift {
  id: string
  tittel: string
  kategori: string
  beskrivelse: string | null
  bilde_url: string | null
  prep_time: number | null
  porsjoner: number | null
  created_at: string
  ingredienser: Ingrediens[]
  steg: Steg[]
}

// Hent alle oppskrifter
export async function getOppskrifter(): Promise<Oppskrift[]> {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Feil ved henting av oppskrifter:', error)
    return []
  }

  console.log('✅ Hentet oppskrifter:', data?.length || 0)
  return data || []
}

// Hent oppskrifter etter kategori
export async function getOppskrifterByKategori(kategori: string): Promise<Oppskrift[]> {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('*')
    .eq('kategori', kategori)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Feil ved henting av oppskrifter for kategori:', error)
    return []
  }

  return data || []
}

// Hent én oppskrift med ingredienser og steg
export async function getOppskrift(id: string): Promise<Oppskrift | null> {
  // Hent oppskriften
  const { data: oppskrift, error: oppskriftError } = await supabase
    .from('oppskrifter')
    .select('*')
    .eq('id', id)
    .single()

  if (oppskriftError || !oppskrift) {
    console.error('❌ Feil ved henting av oppskrift:', oppskriftError)
    return null
  }

  // Hent ingredienser
  const { data: ingredienser, error: ingrediensError } = await supabase
    .from('ingredienser')
    .select('*')
    .eq('oppskrift_id', id)
    .order('rekkefolge', { ascending: true })

  if (ingrediensError) {
    console.error('❌ Feil ved henting av ingredienser:', ingrediensError)
  }

  // Hent steg
  const { data: steg, error: stegError } = await supabase
    .from('steg')
    .select('*')
    .eq('oppskrift_id', id)
    .order('rekkefolge', { ascending: true })

  if (stegError) {
    console.error('❌ Feil ved henting av steg:', stegError)
  }

  return {
    ...oppskrift,
    ingredienser: ingredienser || [],
    steg: steg || []
  }
}

// Hent alle kategorier (unike)
export async function getKategorier(): Promise<string[]> {
  const { data, error } = await supabase
    .from('oppskrifter')
    .select('kategori')

  if (error) {
    console.error('❌ Feil ved henting av kategorier:', error)
    return []
  }

  // Fjern duplikater
  const kategorier: string[] = []
  data.forEach((item) => {
    if (!kategorier.includes(item.kategori)) {
      kategorier.push(item.kategori)
    }
  })
  
  console.log('✅ Kategorier:', kategorier)
  return kategorier
}