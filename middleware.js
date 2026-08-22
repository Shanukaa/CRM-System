import { NextResponse } from 'next/server';
import { verifySessionToken } from './lib/session';

export async function middleware(req) {
  const token = req.cookies.get('session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  const { pathname } = req.nextUrl;

  const DAILY_RECORDS_ANALYTICS = '/dashboard/daily-records/analytics';

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // The "social" role is locked down to Daily Records Analytics only —
    // every other /dashboard/* route bounces back there.
    if (session.usertype === 'social') {
      if (pathname !== DAILY_RECORDS_ANALYTICS) {
        return NextResponse.redirect(new URL(DAILY_RECORDS_ANALYTICS, req.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith('/dashboard/users') && session.usertype !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/welcome', req.url));
    }
    if (pathname === '/dashboard' && session.usertype !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/welcome', req.url));
    }
    if (pathname.startsWith('/dashboard/leads/analytics') && session.usertype !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/welcome', req.url));
    }
    if (pathname.startsWith(DAILY_RECORDS_ANALYTICS) && session.usertype !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/welcome', req.url));
    }
  }

  if (pathname === '/login' && session) {
    const home =
      session.usertype === 'admin' ? '/dashboard' : session.usertype === 'social' ? DAILY_RECORDS_ANALYTICS : '/dashboard/welcome';
    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
