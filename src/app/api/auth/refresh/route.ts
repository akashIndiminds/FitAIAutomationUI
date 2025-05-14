// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/config/appconfig';

export async function POST(request: NextRequest) {
  try {
    // Get the token from the cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Forward the refresh request to the backend API
    const response = await fetch(`${config.baseUrl}/api/login/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.loginCredentials),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success || data.msg.status !== 'success') {
      return NextResponse.json(
        { success: false, message: 'Failed to refresh token' },
        { status: 401 }
      );
    }
    
    // Return the new token
    const newToken = data.msg.token;
    const expiresIn = 60 * 60; // 1 hour in seconds
    
    // Create a new response with the updated token
    const newResponse = NextResponse.json({ success: true, token: newToken });
    
    // Set the new token as a cookie
    newResponse.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Set the login time
    newResponse.cookies.set('login_time', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    return newResponse;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}