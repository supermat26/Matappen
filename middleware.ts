import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// For middleware bruker vi en enkel metode
export async function middleware(req: NextRequest) {
  // Opprett en Supabase-klient uten cookies (bruker standard auth)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  // Hent session fra request (via Authorization header eller cookies)
  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Sider som krever innlogging
  const protectedPaths = ['/matplanlegger', '/favoritter']

  // Hvis brukeren prøver å gå til en beskyttet side uten å være logget inn
  if (protectedPaths.some(p => path.startsWith(p)) && !session) {
    const redirectUrl = new URL('/auth', req.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Hvis brukeren er logget inn og prøver å gå til /auth, send til forsiden
  if (path === '/auth' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

// Konfigurer hvilke stier middleware skal kjøres på
export const config = {
  matcher: [
    '/matplanlegger/:path*',
    '/favoritter/:path*',
    '/auth',
  ],
}