// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/appconfig';

export async function POST(request: NextRequest) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Create response that will clear cookies
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear auth cookies
    response.cookies.delete('auth_token');
    response.cookies.delete('login_time');
    
    // If token exists, attempt to logout from backend
    if (token) {
      try {
        await fetch(`${config.baseUrl}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // We don't need to wait for or check the response
        // as we're logging out locally regardless
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with local logout even if backend fails
      }
    }
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies
    const response = NextResponse.json(
      { success: false, message: 'Error during logout, but cookies cleared' },
      { status: 500 }
    );
    
    response.cookies.delete('auth_token');
    response.cookies.delete('login_time');
    
    return response;
  }
}