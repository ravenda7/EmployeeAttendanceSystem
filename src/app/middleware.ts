import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // If no token or no role, redirect to sign-in
  if (!token || !token.role) {
    console.log('Middleware: No valid session or role, redirecting to /sign-in');
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const role = token.role;
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      console.log(`Middleware: User with role ${role} denied access to ${pathname}, redirecting to /`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow access if role matches or route is not protected
  console.log(`Middleware: User with role ${role} allowed access to ${pathname}`);
  return NextResponse.next();
}

// Define protected routes
export const config = {
  matcher: ['/admin/:path*'],
};