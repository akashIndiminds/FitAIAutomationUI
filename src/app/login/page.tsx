'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import authService from '@/services/authService';
import FloatingElements from './components/FloatingElements';
import LoginCard from './components/LoginCard';
import Logo from './components/Logo';
import LoginForm from './components/LoginForm';
import SystemBlockedMessage from './components/SystemBlockedMessage';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [systemBlocked, setSystemBlocked] = useState(false);
  const [systemBlockMessage, setSystemBlockMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn || !loginId || !password) return;

    setIsLoggingIn(true);

    try {
      const localValidation = await authService.validateLocalCredentials(loginId, password);

      if (localValidation.ResponseCode === 200) {
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

  const processNseLogin = async () => {
    try {
      const response = await authService.login();

      if (response.success && response.msg.status === 'success' && response.msg.token) {
        authService.setToken(response.msg.token);
        authService.setLoginTime(Date.now().toString());
        authService.startTokenRefresh();
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

  const handleSystemBlocked = (message: string) => {
    setSystemBlocked(true);
    setSystemBlockMessage(message || 'System is currently unavailable. Please try again later.');
    toast.error(message || 'System is currently unavailable');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Toaster position="top-right" />
      {isClient && <FloatingElements />}
      <LoginCard>
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-6">Welcome Back!</h2>
        {systemBlocked ? (
          <SystemBlockedMessage message={systemBlockMessage} />
        ) : (
          <LoginForm
            loginId={loginId}
            setLoginId={setLoginId}
            password={password}
            setPassword={setPassword}
            isLoggingIn={isLoggingIn}
            handleSubmit={handleSubmit}
          />
        )}
      </LoginCard>
    </div>
  );
}