import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/terms-of-service', '/privacy-policy'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow all API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
