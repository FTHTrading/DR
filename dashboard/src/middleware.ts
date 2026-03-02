import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * DICS Middleware — Access Control
 *
 * Layer 1: Cloudflare Zero Trust (network-level, applied via Access Policy)
 *   - Protects /console/* and /api/* at the edge
 *   - Injects signed JWT in `CF-Access-JWT-Assertion` header
 *
 * Layer 2: This middleware (application-level, cookie / header check)
 *   - Validates JWT presence before rendering
 *   - Redirects browsers to /login if unauthenticated
 *   - Returns 401 JSON for API requests without JWT
 *
 * The /login page itself is unprotected — Zero Trust handles the
 * OIDC/SAML flow and redirects back with the JWT.
 */

const PROTECTED_PREFIXES = ['/console', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /console/* and /api/* routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Cloudflare Access JWT (production) or session cookie (dev)
  const cfJwt = request.headers.get('cf-access-jwt-assertion');
  const sessionCookie = request.cookies.get('dics_session');

  if (cfJwt || sessionCookie) {
    return NextResponse.next();
  }

  // API routes: return 401 JSON instead of redirect
  if (pathname.startsWith('/api')) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Valid authentication required' },
      { status: 401 }
    );
  }

  // Console routes: redirect to login
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/console/:path*', '/api/:path*'],
};
