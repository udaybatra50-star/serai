import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = 'uday'
const COOKIE_NAME = 'serai_access'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // Check cookie
  const accessCookie = request.cookies.get(COOKIE_NAME)
  if (accessCookie?.value === SITE_PASSWORD) {
    return NextResponse.next()
  }

  // Not unlocked — show locked page
  if (pathname !== '/locked') {
    const url = request.nextUrl.clone()
    url.pathname = '/locked'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
