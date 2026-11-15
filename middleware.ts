import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const GUEST_COOKIE = 'wedding_gate';
const ADMIN_COOKIE = 'admin_gate';

// Two separate gates:
// - guest site (/, /gallery, etc.) needs the shared wedding password, set via /gate
// - /admin needs the separate admin password, set via /admin/login
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images');
  if (isPublicAsset) return NextResponse.next();

  // Daily Supabase keep-alive from Vercel cron. It has no cookies, so it skips
  // the password gates; the route itself checks CRON_SECRET.
  if (pathname === '/api/keepalive') return NextResponse.next();

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    if (isAdminLogin) return NextResponse.next();
    const cookie = request.cookies.get(ADMIN_COOKIE);
    if (await verifyToken('admin', process.env.ADMIN_PASSWORD, cookie?.value)) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  const isGateRoute = pathname === '/gate' || pathname.startsWith('/api/gate');
  const isRsvpApi = pathname.startsWith('/api/rsvp');
  if (isGateRoute) return NextResponse.next();

  const cookie = request.cookies.get(GUEST_COOKIE);
  if (await verifyToken('guest', process.env.WEDDING_PASSWORD, cookie?.value)) {
    return NextResponse.next();
  }

  if (isRsvpApi) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/gate';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
