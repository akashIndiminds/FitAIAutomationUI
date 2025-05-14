// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const loginTime = request.cookies.get('login_time')?.value;
  
  // If no token or login time, redirect to login page
  if (!token || !loginTime) {
    // But only if we're not already on the login page
    if (!request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Check if token is expired (45 minutes validity)
  const loginTimestamp = Number(loginTime);
  const currentTime = Date.now();
  const tokenExpirationTime = 45 * 60 * 1000; // 45 minutes
  const isExpired = currentTime - loginTimestamp > tokenExpirationTime;
  
  // If token is expired and user is not on login page, redirect to login
  if (isExpired && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is on login page and token is valid, redirect to dashboard
  if (request.nextUrl.pathname.startsWith('/login') && !isExpired) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure the paths that should be checked by the middleware
export const config = {
  matcher: [
    // Match all paths except for API routes, static files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};