import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SITE_PASSWORD = 'uday'
const COOKIE_NAME = 'serai_access'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow the password check API route through
  if (pathname === '/api/unlock') {
    return NextResponse.next({ request })
  }

  // Check if user has unlocked the site
  const accessCookie = request.cookies.get(COOKIE_NAME)
  if (!accessCookie || accessCookie.value !== SITE_PASSWORD) {
    // Show password gate for all pages except static assets
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/favicon')) {
      const url = request.nextUrl.clone()
      url.pathname = '/locked'
      if (pathname !== '/locked') {
        return NextResponse.rewrite(url)
      }
    }
  }

  let response = NextResponse.next({ request })

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protect dashboard routes
  const protectedPaths = ['/brand/', '/retailer/', '/admin', '/onboarding/']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Redirect signed-in users away from auth pages
  if (user && (pathname === '/auth/signin' || pathname === '/auth/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)',
  ],
}
