import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabase/server-client';

export async function middleware(request: NextRequest) {
  // Demo mode — skip all auth checks
  if (process.env.USE_MOCK_DATA === 'true') {
    return NextResponse.next();
  }

  try {
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    const { data: { session } } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isOnboarding = pathname.startsWith('/onboarding');
    const isProtected = pathname.startsWith('/dashboard') ||
                        pathname.startsWith('/patients') ||
                        pathname.startsWith('/appointments') ||
                        pathname.startsWith('/conversations') ||
                        pathname.startsWith('/settings') ||
                        pathname.startsWith('/setup') ||
                        pathname.startsWith('/knowledge-base') ||
                        pathname.startsWith('/loyalty') ||
                        pathname === '/';

    // Not logged in → redirect to login (except auth pages)
    if (!session && (isProtected || isOnboarding)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Logged in → redirect away from auth pages to dashboard
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Logged in + on onboarding page → redirect to dashboard
    if (session && isOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|auth/callback).*)'],
};
