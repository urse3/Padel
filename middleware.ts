import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Comprobar si es un link de invitación a un partido
  // Formato: /partidos/[uuid]
  const isMatchInvite = /^\/partidos\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(pathname)

  if (isMatchInvite && !user) {
    // Es una invitación inteligente. Guardamos el ID del partido en una cookie y lo enviamos a registrarse
    const matchId = pathname.split('/').pop()
    const url = request.nextUrl.clone()
    url.pathname = '/registro'
    url.searchParams.set('invite', matchId || '')
    
    const response = NextResponse.redirect(url)
    // Guardamos la cookie de la invitación pendiente
    if (matchId) {
      response.cookies.set('pending_invite_partido_id', matchId, { maxAge: 3600, path: '/' })
    }
    return response
  }

  // Rutas privadas normales
  const isPrivateRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/partidos') ||
    pathname.startsWith('/torneos') ||
    pathname.startsWith('/ranking') ||
    pathname.startsWith('/amigos') ||
    pathname.startsWith('/admin')

  if (isPrivateRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si ya está logueado y va al login/registro, redirigir al dashboard
  if (user && (
    pathname === '/login' ||
    pathname === '/registro'
  )) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
