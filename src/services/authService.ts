// services/authService.ts
import axios, { AxiosInstance } from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { toast } from 'react-hot-toast';
import { config } from '@/app/config/appconfig';

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
  
  constructor() {
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
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
              // Get fresh token and retry request
              const token = this.getToken();
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              return this.api(originalRequest);
            } else {
              // If refresh failed, redirect to login
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
        params: { loginId, password }
      });
      return response.data;
    } catch (error) {
      console.error('Local validation error:', error);
      throw error;
    }
  }

  /**
   * Logs in user with NSE credentials
   */
  async login(credentials = config.loginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post<LoginResponse>('/api/login/auth', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Completes login process after NSE validation
   */
  async completeLoginProcess(loginId: string, password: string, nseResponseCode: number): Promise<LocalValidationResponse> {
    try {
      const response = await this.api.get<LocalValidationResponse>('/nse-login', {
        params: { loginId, password, nseResponseCode }
      });
      return response.data;
    } catch (error) {
      console.error('Login completion error:', error);
      throw error;
    }
  }

  /**
   * Refreshes the authentication token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await this.login();
      
      if (response.success && response.msg.status === 'success' && response.msg.token) {
        this.setToken(response.msg.token);
        this.setLoginTime(Date.now().toString());
        this.retryCount = 0;
        this.scheduleNextRefresh(30 * 60 * 1000); // Schedule next refresh in 30 minutes
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
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

    const token = this.getToken();
    
    if (token) {
      try {
        await this.api.post('/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Logout request successful');
      } catch (error) {
        console.log('Logout request failed', error);
      }
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
  // Add a 5-second delay before scheduling the first refresh
  setTimeout(() => {
    this.scheduleNextRefresh(30 * 60 * 1000); // 30 minutes
    console.log('Token refresh scheduled for 30 minutes from now');
  }, 5000); // 5-second delay
}
  /**
   * Schedules next token refresh
   */
  private scheduleNextRefresh(delay: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.refreshTimer = setTimeout(() => {
      this.refreshNseToken();
    }, delay);
  }

  /**
   * Refreshes NSE token
   */
  private async refreshNseToken(): Promise<void> {
    console.log('Attempting to refresh NSE token...');
    
    try {
      const response = await this.login();
      
      if (response.success && response.msg.status === 'success' && response.msg.token) {
        console.log('Token refreshed successfully');
        this.setToken(response.msg.token);
        this.setLoginTime(Date.now().toString());
        this.retryCount = 0;
        this.scheduleNextRefresh(30 * 60 * 1000);
      } else {
        console.error('Token refresh failed with response:', response);
        this.handleRefreshFailure();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.handleRefreshFailure();
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
    return !!token && !this.isTokenExpired();
  }
}

export const authService = new AuthService();
export default authService;