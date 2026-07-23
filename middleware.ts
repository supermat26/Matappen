import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseClient'

export async function middleware(req: NextRequest) {
  // Opprett en server-side Supabase-klient
  const supabase = createServerClient(req.cookies)

  // Sjekk om brukeren er logget inn
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
