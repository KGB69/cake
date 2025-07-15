import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Only run this middleware for admin routes, except for the login page
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    // Check for the admin token cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    
    // If not authenticated, redirect to login page
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
