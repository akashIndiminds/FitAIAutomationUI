// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/appconfig';

export async function POST(request: NextRequest) {
  try {
    console.log('Token refresh requested');
    
    // Get current login time from cookies (for monitoring purposes)
    const currentLoginTime = request.cookies.get('login_time')?.value;
    console.log(`Current login time: ${currentLoginTime}`);
    
    // Always refresh using NSE credentials - this ensures continuous session
    const refreshResponse = await fetch(`${config.baseUrl}/api/login/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.loginCredentials),
    });
    
    const refreshData = await refreshResponse.json();
    
    if (!refreshResponse.ok || !refreshData.success || refreshData.msg.status !== 'success' || !refreshData.msg.token) {
      console.error('NSE token refresh failed:', refreshData);
      return NextResponse.json(
        { success: false, message: 'Failed to refresh token with NSE' },
        { status: 401 }
      );
    }
    
    // Get the new token and set expiry time
    const newToken = refreshData.msg.token;
    const expiresIn = 60 * 60; // 1 hour in seconds
    
    console.log('Token refreshed successfully');
    
    // Create response with new token
    const response = NextResponse.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
    
    // Set the updated token in cookies
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Update the login time
    response.cookies.set('login_time', Date.now().toString(), {
      httpOnly: true,
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