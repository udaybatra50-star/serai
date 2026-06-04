import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = 'uday'
const COOKIE_NAME = 'serai_access'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, SITE_PASSWORD, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
}
