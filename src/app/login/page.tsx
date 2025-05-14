'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import authService from '@/services/authService';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [systemBlocked, setSystemBlocked] = useState(false);
  const [systemBlockMessage, setSystemBlockMessage] = useState('');
  const [isClient, setIsClient] = useState(false); // Added to control client-side rendering

  const loginCardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 3D card effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!loginCardRef.current) return;

      const card = loginCardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate rotation based on mouse position
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      if (!loginCardRef.current) return;
      loginCardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    const card = loginCardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  /**
   * Handle login form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn || !loginId || !password) return;

    setIsLoggingIn(true);

    try {
      // Step 1: Validate local credentials
      const localValidation = await authService.validateLocalCredentials(loginId, password);

      if (localValidation.ResponseCode === 200) {
        // Step 2: Process NSE login
        await processNseLogin();
      } else if (localValidation.ResponseCode === 401) {
        toast.error(localValidation.ResponseMessage);
      } else if (localValidation.ResponseCode === 403) {
        handleSystemBlocked(localValidation.ResponseMessage);
      } else {
        toast.error(localValidation.ResponseMessage || 'An error occurred');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Please try again later.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  /**
   * Process NSE login using credentials from config
   */
  const processNseLogin = async () => {
    try {
      const response = await authService.login();

      if (response.success && response.msg.status === 'success' && response.msg.token) {
        // Store token and login time
        authService.setToken(response.msg.token);
        authService.setLoginTime(Date.now().toString());

        // Start token refresh
        authService.startTokenRefresh();

        // Finalize login
        await finalizeLogin(601);
      } else if (response.msg.status === 'failed') {
        await finalizeLogin(701);
      } else {
        toast.error('Unexpected NSE response. Please try again.');
      }
    } catch (error) {
      console.error('NSE login error:', error);
      toast.error('NSE server is currently unavailable. Please try again later.');
    }
  };

  /**
   * Finalize login process after NSE response
   */
  const finalizeLogin = async (nseResponseCode: number) => {
    try {
      const response = await authService.completeLoginProcess(loginId, password, nseResponseCode);

      if (response.ResponseCode === 200) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else if (response.ResponseCode === 403) {
        handleSystemBlocked(response.ResponseMessage);
      } else {
        toast.error(response.ResponseMessage);
      }
    } catch (error) {
      console.error('Login completion error:', error);
      toast.error('An error occurred during login. Please try again.');
    }
  };

  /**
   * Handle system blocked scenarios
   */
  const handleSystemBlocked = (message: string) => {
    setSystemBlocked(true);
    setSystemBlockMessage(message || 'System is currently unavailable. Please try again later.');
    toast.error(message || 'System is currently unavailable');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Toaster position="top-right" />

      {/* Animated floating elements - only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                scale: Math.random() * 0.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                transition: { duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: "reverse" }
              }}
              style={{
                width: `${Math.random() * 100 + 20}px`,
                height: `${Math.random() * 100 + 20}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Login Card with 3D effect */}
      <motion.div
        ref={loginCardRef}
        className="relative w-full max-w-md overflow-hidden bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-50" />

        <div className="relative p-8 z-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {/* Replace with your actual logo */}
              <span className="text-2xl font-bold text-white">FITAI</span>
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Welcome Back!
          </h2>

          {systemBlocked ? (
            <div className="bg-red-500/20 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">System Unavailable</h3>
              <p className="text-white/80">{systemBlockMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="loginId" className="text-sm font-medium text-white/90">
                  Login ID
                </label>
                <div className="relative">
                  <input
                    id="loginId"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none text-white placeholder-white/50 transition-all"
                    placeholder="Enter your login ID"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 group-focus-within:opacity-100 -z-10 blur-md transition-opacity" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/90">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none text-white placeholder-white/50 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-0 group-focus-within:opacity-100 -z-10 blur-md transition-opacity" />
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-semibold shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoggingIn ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </div>
                  ) : (
                    'Log In'
                  )}
                </motion.button>
              </div>
            </form>
          )}
        </div>

        {/* Card bottom glass reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/10 to-white/0" />
      </motion.div>
    </div>
  );
}