import { NextResponse } from 'next/server';
import { verifySessionToken } from './lib/session';

export async function middleware(req) {
  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (pathname.startsWith('/dashboard/users') && session.usertype !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
