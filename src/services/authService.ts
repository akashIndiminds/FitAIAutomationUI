// services/authService.ts
import axios, { AxiosInstance } from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { config } from '@/config/appconfig';

export interface LoginCredentials {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  msg: {
    status: string;
    token?: string;
    message?: string;
  };
}

export interface LocalValidationResponse {
  ResponseCode: number;
  ResponseMessage: string;
}

class AuthService {
  private readonly api: AxiosInstance;
  private refreshTimer: NodeJS.Timeout | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly LOGIN_TIME_KEY = 'login_time';
  private readonly REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
  
  constructor() {
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout for regular requests
    });

    // Add response interceptor for handling token expiration
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip refresh token for logout requests
        if (originalRequest.url?.includes('/api/logout')) {
          return Promise.reject(error);
        }

        // Handle 401 status or error code 803 (token expired)
        if (
          (error.response?.status === 401 || 
          (error.response?.data?.responseCode === '803' || 
           error.response?.data?.ResponseCode === 401 || 
           error.response?.data?.msg?.status === 'failed')) && 
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          console.log('Intercepted unauthorized error, attempting token refresh');
          
          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              const token = this.getToken();
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return this.api(originalRequest);
            } else {
              this.logout(true);
              return Promise.reject(new Error('Session expired. Please log in again.'));
            }
          } catch (refreshError) {
            console.error('Error during token refresh process', refreshError);
            this.logout(true);
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validates user credentials with the local endpoint
   */
  async validateLocalCredentials(loginId: string, password: string): Promise<LocalValidationResponse> {
    try {
      const response = await this.api.get<LocalValidationResponse>('/login', {
        params: { loginId, password },
        timeout: 15000, // 15 seconds for credential validation
      });
      return response.data;
    } catch (error: any) {
      console.error('Local validation error:', error);
      
      // Handle timeout specifically for local validation
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout while validating credentials. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Logs in user with NSE credentials
   */
  async login(credentials = config.loginCredentials): Promise<LoginResponse> {
    try {
      // Extended timeout for NSE API since it's external
      const response = await this.api.post<LoginResponse>('/api/login/auth', credentials, {
        timeout: 45000, // 45 seconds timeout for NSE API
      });
      
      if (response.data.success && response.data.msg.token) {
        this.setToken(response.data.msg.token);
        this.setLoginTime(Date.now().toString());
        this.startTokenRefresh();
      }
      
      return response.data;
    } catch (error: any) {
      console.error('NSE login error:', error);
      
      // Enhanced error handling for NSE API
      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error('NSE server connection timed out. The server is taking longer than expected to respond.');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      
      if (error.response?.status === 0 || !error.response) {
        const networkError = new Error('Unable to connect to NSE server. Please check your internet connection.');
        networkError.name = 'NetworkError';
        throw networkError;
      }
      
      // Handle specific NSE error codes
      if (error.response?.data?.msg?.message) {
        const nseError = new Error(error.response.data.msg.message);
        nseError.name = 'NSEError';
        throw nseError;
      }
      
      throw error;
    }
  }

  /**
   * Completes login process after NSE validation
   */
  async completeLoginProcess(loginId: string, password: string, nseResponseCode: number): Promise<LocalValidationResponse> {
    try {
      const response = await this.api.get<LocalValidationResponse>('/nse-login', {
        params: { loginId, password, nseResponseCode },
        timeout: 20000, // 20 seconds for completion
      });
      return response.data;
    } catch (error: any) {
      console.error('Login completion error:', error);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout during login completion. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Refreshes the authentication token using API endpoint
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.token) {
        this.retryCount = 0;
        console.log('Token refreshed successfully via API');
        return true;
      }
      
      console.log('API refresh failed, attempting direct refresh');
      return await this.refreshDirectly();
    } catch (error) {
      console.error('Token refresh API error:', error);
      return await this.refreshDirectly();
    }
  }

  /**
   * Direct token refresh without using the API endpoint
   */
  private async refreshDirectly(): Promise<boolean> {
    try {
      const response = await this.login(config.loginCredentials);
      
      if (response.success && response.msg.status === 'success' && response.msg.token) {
        this.setToken(response.msg.token);
        this.setLoginTime(Date.now().toString());
        this.retryCount = 0;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Direct token refresh error:', error);
      return false;
    }
  }

  /**
   * Logs out the user
   */
  async logout(silent = false): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('Logout request successful');
    } catch (error) {
      console.log('Logout request failed', error);
    }
    
    this.clearTokens();
    
    if (!silent) {
      window.location.href = '/login';
    }
  }

  /**
   * Starts token refresh process
   */
  startTokenRefresh(): void {
    this.retryCount = 0;
    // Clear any existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Set the token refresh to run every REFRESH_INTERVAL
    this.scheduleNextRefresh(this.REFRESH_INTERVAL);
    console.log(`Token refresh scheduled for ${this.REFRESH_INTERVAL / (60 * 1000)} minutes from now`);
  }

  /**
   * Schedules next token refresh
   */
  private scheduleNextRefresh(delay: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().then(success => {
        if (success) {
          console.log('Token refreshed successfully, scheduling next refresh');
          this.scheduleNextRefresh(this.REFRESH_INTERVAL);
        } else {
          console.error('Token refresh failed, attempting retry');
          this.handleRefreshFailure();
        }
      }).catch(err => {
        console.error('Error in token refresh:', err);
        this.handleRefreshFailure();
      });
    }, delay);
  }

  /**
   * Handles refresh failure with retry mechanism
   */
  private handleRefreshFailure(): void {
    this.retryCount++;
    console.log(`Token refresh failed. Retry count: ${this.retryCount}/${this.maxRetries}`);
    
    if (this.retryCount >= this.maxRetries) {
      console.error('Max refresh retries reached. Logging out user.');
      this.logout(true);
    } else {
      this.scheduleNextRefresh(5 * 60 * 1000); // Retry in 5 minutes
    }
  }

  /**
   * Clears authentication tokens
   */
  private clearTokens(): void {
    deleteCookie(this.TOKEN_KEY);
    deleteCookie(this.LOGIN_TIME_KEY);
  }

  /**
   * Sets authentication token
   */
  setToken(token: string): void {
    setCookie(this.TOKEN_KEY, token, { maxAge: 60 * 60 }); // 1 hour expiry
  }

  /**
   * Gets authentication token
   */
  getToken(): string | null {
    return getCookie(this.TOKEN_KEY) as string | null;
  }

  /**
   * Sets login timestamp
   */
  setLoginTime(time: string): void {
    setCookie(this.LOGIN_TIME_KEY, time, { maxAge: 60 * 60 }); // 1 hour expiry
  }

  /**
   * Gets login timestamp
   */
  getLoginTime(): string | null {
    return getCookie(this.LOGIN_TIME_KEY) as string | null;
  }

  /**
   * Checks if token is expired
   */
  isTokenExpired(): boolean {
    const loginTime = this.getLoginTime();
    if (!loginTime) return true;

    const loginTimestamp = Number(loginTime);
    const currentTime = Date.now();
    const tokenExpirationTime = 45 * 60 * 1000; // 45 minutes (NSE expiration time)
    
    return currentTime - loginTimestamp > tokenExpirationTime;
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!!token && !this.isTokenExpired()) {
      // If authenticated and no refresh timer, start one
      if (!this.refreshTimer) {
        this.startTokenRefresh();
      }
      return true;
    }
    return false;
  }
}

export const authService = new AuthService();
export default authService;