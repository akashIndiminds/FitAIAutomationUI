// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/appconfig';

export async function POST(request: NextRequest) {
  try {
    console.log('Token refresh API route called');
    
    // Always refresh using NSE credentials from config
    const refreshResponse = await fetch(`${config.baseUrl}/api/login/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.loginCredentials),
      cache: 'no-store',
    });
    
    const refreshData = await refreshResponse.json();
    
    if (!refreshResponse.ok || !refreshData.success || refreshData.msg.status !== 'success' || !refreshData.msg.token) {
      console.error('NSE token refresh failed:', refreshData);
      return NextResponse.json(
        { success: false, message: 'Failed to refresh token with NSE' },
        { status: 401 }
      );
    }
    
    // Get the new token
    const newToken = refreshData.msg.token;
    const expiresIn = 45 * 60; // 45 minutes in seconds (matching NSE expiration)
    
    console.log('Token refreshed successfully via API route');
    
    // Create response with new token
    const response = NextResponse.json({
      success: true,
      token: newToken, // Send token for client-side storage as well
      message: 'Token refreshed successfully'
    });
    
    // Set the updated token in cookies (both HTTP-only and client-accessible)
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Set a non-HTTP-only version for client access
    response.cookies.set('auth_token_client', newToken, {
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Update the login time
    const currentTime = Date.now().toString();
    response.cookies.set('login_time', currentTime, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Also set a client-accessible version
    response.cookies.set('login_time_client', currentTime, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during token refresh' },
      { status: 500 }
    );
  }
}
