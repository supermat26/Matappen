import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Sider som krever innlogging
  const protectedPaths = ['/matplanlegger', '/favoritter']
  const path = req.nextUrl.pathname

  if (protectedPaths.some(p => path.startsWith(p)) && !session) {
    const redirectUrl = new URL('/auth', req.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Hvis allerede logget inn og går til /auth, send til forsiden
  if (path === '/auth' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/matplanlegger/:path*', '/favoritter/:path*', '/auth'],
}
