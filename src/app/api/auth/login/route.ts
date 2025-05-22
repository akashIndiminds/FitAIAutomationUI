// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/config/appconfig';

export async function POST(request: NextRequest) {
  try {
    // Get credentials from request body
    const { loginId, password } = await request.json();
    
    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: 'Login ID and password are required' },
        { status: 400 }
      );
    }
    
    // Step 1: Validate credentials with local endpoint
    const localValidationResponse = await fetch(`${config.baseUrl}/login?loginId=${loginId}&password=${password}`);
    const localValidation = await localValidationResponse.json();
    
    if (localValidation.ResponseCode !== 200) {
      return NextResponse.json(
        { 
          success: false, 
          message: localValidation.ResponseMessage || 'Invalid credentials',
          code: localValidation.ResponseCode 
        },
        { status: localValidation.ResponseCode === 403 ? 403 : 401 }
      );
    }
    
    // Step 2: Process NSE login
    const nseLoginResponse = await fetch(`${config.baseUrl}/api/login/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.loginCredentials),
    });
    
    const nseLogin = await nseLoginResponse.json();
    
    if (!nseLogin.success || nseLogin.msg.status !== 'success') {
      // If NSE login failed, try to complete login with failure code
      return await completeLogin(loginId, password, 701, NextResponse);
    }
    
    // Step 3: Store token and finalize login
    const token = nseLogin.msg.token;
    const expiresIn = 60 * 60; // 1 hour in seconds
    
    // Complete login process with success code
    return await completeLogin(loginId, password, 601, NextResponse, token, expiresIn);
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function completeLogin(
  loginId: string, 
  password: string, 
  nseResponseCode: number, 
  NextResponse: any,
  token?: string,
  expiresIn?: number
) {
  try {
    // Complete login process
    const completeLoginResponse = await fetch(
      `${config.baseUrl}/nse-login?loginId=${loginId}&password=${password}&nseResponseCode=${nseResponseCode}`
    );
    
    const completeLogin = await completeLoginResponse.json();
    
    if (completeLogin.ResponseCode !== 200) {
      return NextResponse.json(
        { 
          success: false, 
          message: completeLogin.ResponseMessage || 'Login failed',
          code: completeLogin.ResponseCode 
        },
        { status: completeLogin.ResponseCode === 403 ? 403 : 401 }
      );
    }
    
    // If no token provided (should not happen in success path), return error
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }
    
    // Create response with success message
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      token
    });
    
    // Set cookies for client-side auth
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    response.cookies.set('login_time', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Complete login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login completion failed' },
      { status: 500 }
    );
  }
}