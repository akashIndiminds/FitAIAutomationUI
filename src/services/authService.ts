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
  private refreshInProgress: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_CLIENT_KEY = 'auth_token_client';
  private readonly LOGIN_TIME_KEY = 'login_time';
  private readonly LOGIN_TIME_CLIENT_KEY = 'login_time_client';
  private readonly REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes
  private readonly TOKEN_EXPIRATION = 45 * 60 * 1000; // 45 minutes
  
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
        if (originalRequest?.url?.includes('/api/logout')) {
          return Promise.reject(error);
        }

        // Handle 401 status or error code 803 (token expired)
        if (
          (error.response?.status === 401 || 
          (error.response?.data?.responseCode === '803' || 
           error.response?.data?.ResponseCode === 401 || 
           error.response?.data?.msg?.status === 'failed')) && 
          !originalRequest?._retry
        ) {
          if (originalRequest) {
            originalRequest._retry = true;
          }
          console.log('Intercepted unauthorized error, attempting token refresh');
          
          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              const token = this.getToken();
              if (originalRequest && token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return this.api(originalRequest);
              }
              return Promise.reject(new Error('Request couldn\'t be retried after refresh'));
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

    // Initialize refresh mechanism if in browser
    if (typeof window !== 'undefined') {
      this.initializeTokenRefresh();
    }
  }

  /**
   * Initialize the token refresh mechanism on client side
   */
  initializeTokenRefresh(): void {
    if (this.isAuthenticated()) {
      console.log('User is authenticated, starting token refresh mechanism');
      this.startTokenRefresh();
    } else {
      console.log('User is not authenticated, skipping token refresh setup');
    }
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
   * Refreshes the authentication token
   * Returns true if successful, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshInProgress) {
      console.log('Token refresh already in progress, waiting...');
      // Wait for the current refresh to complete
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!this.refreshInProgress) {
            clearInterval(checkInterval);
            // Return success based on whether we have a valid token
            resolve(!!this.getToken() && !this.isTokenExpired());
          }
        }, 500); // Check every 500ms
      });
    }
  
    try {
      this.refreshInProgress = true;
      console.log('Refreshing token...');
    
      // Try API route first (which uses NSE credentials from config)
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.log('API refresh failed with status:', response.status);
        throw new Error('API refresh failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // We still need to set client-side storage since HTTP-only cookies
        // won't be accessible to JS
        this.setToken(data.token);
        this.setLoginTime(Date.now().toString());
        this.retryCount = 0;
        console.log('Token refreshed successfully via API');
        this.refreshInProgress = false;
        return true;
      }
      
      throw new Error('Invalid response from refresh API');
    } catch (error) {
      console.error('API token refresh failed:', error);
      
      try {
        console.log('Attempting direct token refresh...');
        // Direct approach using NSE API
        const response = await this.login();
        
        if (response.success && response.msg.status === 'success' && response.msg.token) {
          this.setToken(response.msg.token);
          this.setLoginTime(Date.now().toString());
          this.retryCount = 0;
          console.log('Token refreshed successfully via direct API call');
          this.refreshInProgress = false;
          return true;
        }
      } catch (directError) {
        console.error('Direct token refresh failed:', directError);
      }
      
      this.refreshInProgress = false;
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
      const token = this.getToken();
      if (token) {
        // Include the token in the logout request
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
      }
      console.log('Logout request completed');
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
      this.refreshTimer = null;
    }
    
    // Calculate time until refresh
    const loginTime = this.getLoginTime();
    let refreshDelay = this.REFRESH_INTERVAL; // Default
    
    if (loginTime) {
      const elapsedTime = Date.now() - Number(loginTime);
      // If more than 5 minutes have passed since login, adjust the next refresh time
      if (elapsedTime > 5 * 60 * 1000) {
        refreshDelay = Math.max(this.REFRESH_INTERVAL - elapsedTime, 60 * 1000);
        console.log(`Adjusted refresh delay based on login time: ${refreshDelay/1000} seconds`);
      }
    }
    
    // Schedule the next refresh
    this.scheduleNextRefresh(refreshDelay);
    console.log(`Token refresh scheduled for ${refreshDelay / (60 * 1000)} minutes from now`);
  }

  /**
   * Schedules next token refresh
   */
  private scheduleNextRefresh(delay: number): void {
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, skipping timer setup');
      return;
    }
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    // Use window.setTimeout to ensure browser context
    this.refreshTimer = setTimeout(() => {
      console.log('Token refresh timer triggered');
      this.refreshToken()
        .then(success => {
          if (success) {
            console.log('Token refreshed automatically, scheduling next refresh');
            // Schedule next refresh from the current time
            this.scheduleNextRefresh(this.REFRESH_INTERVAL);
          } else {
            console.error('Automatic token refresh failed');
            this.handleRefreshFailure();
          }
        })
        .catch(err => {
          console.error('Error in automatic token refresh:', err);
          this.handleRefreshFailure();
        });
    }, delay);
    
    // Store the time when the refresh is scheduled to happen
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('refresh_scheduled_at', (Date.now() + delay).toString());
    }
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
      const retryDelay = Math.min(5 * 60 * 1000 * this.retryCount, 15 * 60 * 1000);
      console.log(`Will retry token refresh in ${retryDelay / (60 * 1000)} minutes`);
      this.scheduleNextRefresh(retryDelay); 
    }
  }

  /**
   * Clears authentication tokens
   */
  private clearTokens(): void {
    deleteCookie(this.TOKEN_KEY);
    deleteCookie(this.TOKEN_CLIENT_KEY);
    deleteCookie(this.LOGIN_TIME_KEY);
    deleteCookie(this.LOGIN_TIME_CLIENT_KEY);
    
    // Also clear localStorage items
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('refresh_scheduled_at');
    }
  }

  /**
   * Sets authentication token
   */
  setToken(token: string): void {
    setCookie(this.TOKEN_KEY, token, { maxAge: 60 * 60 }); // 1 hour expiry
    setCookie(this.TOKEN_CLIENT_KEY, token, { maxAge: 60 * 60, httpOnly: false });

    // Also store in localStorage as backup
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.TOKEN_CLIENT_KEY, token);
    }
  }

  /**
   * Gets authentication token
   */
  getToken(): string | null {
    // Try cookies first
    let token = getCookie(this.TOKEN_KEY) as string | null;
    if (!token) {
      token = getCookie(this.TOKEN_CLIENT_KEY) as string | null;
    }
    
    // Fall back to localStorage if cookie not found
    if (!token && typeof localStorage !== 'undefined') {
      token = localStorage.getItem(this.TOKEN_CLIENT_KEY);
    }
    
    return token;
  }

  /**
   * Sets login timestamp
   */
  setLoginTime(time: string): void {
    setCookie(this.LOGIN_TIME_KEY, time, { maxAge: 60 * 60 }); // 1 hour expiry
    setCookie(this.LOGIN_TIME_CLIENT_KEY, time, { maxAge: 60 * 60, httpOnly: false });
    
    // Also store in localStorage as backup
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LOGIN_TIME_CLIENT_KEY, time);
    }
  }

  /**
   * Gets login timestamp
   */
  getLoginTime(): string | null {
    // Try cookies first
    let loginTime = getCookie(this.LOGIN_TIME_KEY) as string | null;
    if (!loginTime) {
      loginTime = getCookie(this.LOGIN_TIME_CLIENT_KEY) as string | null;
    }
    
    // Fall back to localStorage if cookie not found
    if (!loginTime && typeof localStorage !== 'undefined') {
      loginTime = localStorage.getItem(this.LOGIN_TIME_CLIENT_KEY);
    }
    
    return loginTime;
  }

  /**
   * Checks if token is expired
   */
  isTokenExpired(): boolean {
    const loginTime = this.getLoginTime();
    if (!loginTime) return true;

    try {
      const loginTimestamp = Number(loginTime);
      if (isNaN(loginTimestamp)) return true;
      
      const currentTime = Date.now();
      const elapsed = currentTime - loginTimestamp;
      
      // Token expires after 45 minutes
      const isExpired = elapsed > this.TOKEN_EXPIRATION;
      
      if (isExpired) {
        console.log(`Token expired. Elapsed time: ${elapsed/1000} seconds`);
      }
      
      return isExpired;
    } catch (e) {
      console.error('Error checking token expiration:', e);
      return true;
    }
  }

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = !!token && !this.isTokenExpired();
    
    // If authenticated and no refresh timer, start one
    if (isAuth && typeof window !== 'undefined' && !this.refreshTimer) {
      console.log('User is authenticated but no refresh timer, starting one');
      this.startTokenRefresh();
    }
    
    return isAuth;
  }

  /**
   * Adds authorization header to requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Create a singleton instance
export const authService = new AuthService();
export default authService;
