import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createToken } from '@/lib/auth';
import type { UserRole } from '@/lib/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded mock user for Vercel Demo
    const user = {
      id: 1,
      email: email,
      username: email.split("@")[0] || "admin",
      requires_password_change: 0,
      tenant_id: 1,
      tenant_name: "Demo Tenant"
    };

    // Create encrypted PASETO token
    // Hardcode to admin to ensure the frontend enables all admin features
    const roleString = "admin" as any;

    const token = await createToken({
      sub: user.id.toString(),
      email: user.email,
      name: user.username,
      role: roleString,
      requiresPasswordChange: user.requires_password_change === 1,
      tenantId: user.tenant_id.toString(),
      tenantName: user.tenant_name,
    });

    // Determine redirect
    const redirectTo = '/dashboard'; 

    // Set HttpOnly cookie via next/headers
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'g1_session',
      value: token,
      httpOnly: true,
      secure: false, // Access is over local network HTTP (192.168.x.x) so Secure must be false
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return NextResponse.json(
      {
        success: true,
        redirectTo,
        access_token: "mock-jwt-token-not-used-by-nextjs",
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          role: roleString,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
