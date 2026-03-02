import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * DICS Middleware — Console Access Control
 *
 * Layer 1: Cloudflare Zero Trust (network-level, applied via Access Policy)
 * Layer 2: This middleware (application-level, cookie / header check)
 *
 * In production, Cloudflare Access injects a signed JWT in the
 * `CF-Access-JWT-Assertion` header. If that header is missing and
 * no `dics_session` cookie exists, we redirect to /login.
 *
 * The /login page itself is unprotected — Zero Trust handles the
 * OIDC/SAML flow and redirects back with the JWT.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /console/* routes
  if (!pathname.startsWith('/console')) {
    return NextResponse.next();
  }

  // Check for Cloudflare Access JWT (production) or session cookie (dev)
  const cfJwt = request.headers.get('cf-access-jwt-assertion');
  const sessionCookie = request.cookies.get('dics_session');

  if (cfJwt || sessionCookie) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/console/:path*'],
};
