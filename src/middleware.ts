import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('asg-auth');

  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  
  if (request.nextUrl.pathname === '/admin') {
    if (authCookie) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/dashboard'],
}
