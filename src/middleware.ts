import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value

  const isLoggedIn = !!sessionToken
  const isLoginPage = pathname === '/login'
  const isRootPath = pathname === '/'

  if (isRootPath) {
    const url = new URL(
      isLoggedIn ? '/dashboard/upcoming' : '/login',
      request.url
    )
    return NextResponse.redirect(url)
  }

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(
      new URL('/dashboard/upcoming', request.url)
    )
  }

  if (!isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
