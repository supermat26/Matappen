import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Sider som krever innlogging
  const protectedPaths = ['/matplanlegger', '/favoritter']

  // Sjekk om vi er på en beskyttet side
  if (protectedPaths.some(p => path.startsWith(p))) {
    // Opprett Supabase-klient
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Hent session fra cookies via request
    const { data: { session } } = await supabase.auth.getSession()

    // Hvis ingen session, redirect til login
    if (!session) {
      const redirectUrl = new URL('/auth', req.url)
      redirectUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Hvis brukeren er logget inn og prøver å gå til /auth, send til forsiden
  if (path === '/auth') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/matplanlegger/:path*',
    '/favoritter/:path*',
    '/auth',
  ],
}