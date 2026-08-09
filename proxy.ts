import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value;

  const loginUrl = new URL('/login', request.url);
  const homeUrl = new URL('/', request.url);

  // 1. If there's no token cookie, redirect immediately to login page
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in proxy.');
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Validate the JWT token against Supabase Auth API
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      // Token is invalid, expired, or tampered with
      const response = NextResponse.redirect(loginUrl);
      // Clean up invalid cookie
      response.cookies.delete('sb-access-token');
      return response;
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // 3. Fetch the user's role from the public.profiles table
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.redirect(loginUrl);
    }

    const profileData = await profileResponse.json();
    const role = profileData[0]?.role;

    // 4. Enforce admin role for /admin paths
    if (role !== 'admin') {
      // Redirect authenticated but unauthorized users to home page
      return NextResponse.redirect(homeUrl);
    }

    // User is validated as admin, proceed to the requested route
    return NextResponse.next();

  } catch (error) {
    console.error('Exception in authorization proxy:', error);
    return NextResponse.redirect(loginUrl);
  }
}

// Run proxy only on admin routes
export const config = {
  matcher: ['/admin/:path*'],
};
