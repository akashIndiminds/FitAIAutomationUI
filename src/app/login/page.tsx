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
import {getSelectedConfigurations} from '@/services/fileConfigService';


export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState('');
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
    setLoginStatus('Validating credentials...');

    try {
      const localValidation = await authService.validateLocalCredentials(loginId, password);

      if (localValidation.ResponseCode === 200) {
        setLoginStatus('Connecting to NSE server...');
        await processNseLogin();
      } else if (localValidation.ResponseCode === 401) {
        toast.error(localValidation.ResponseMessage);
        setLoginStatus('');
      } else if (localValidation.ResponseCode === 403) {
        handleSystemBlocked(localValidation.ResponseMessage);
      } else {
        toast.error(localValidation.ResponseMessage || 'Credential validation failed');
        setLoginStatus('');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Please check your internet connection and try again.');
      setLoginStatus('');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const processNseLogin = async () => {
    try {
      setLoginStatus('Authenticating with NSE...');
      
      const response = await authService.login();

      if (response.success && response.msg.status === 'success' && response.msg.token) {
        authService.setToken(response.msg.token);
        authService.setLoginTime(Date.now().toString());
        authService.startTokenRefresh();
        setLoginStatus('Finalizing login...');
        await finalizeLogin(601);
      } else if (response.msg.status === 'failed') {
        // Handle NSE login failure
        setLoginStatus('NSE authentication failed...');
        await finalizeLogin(701);
      } else {
        toast.error('NSE server returned unexpected response. Please try again.');
        setLoginStatus('');
      }
    } catch (error: any) {
      console.error('NSE login error:', error);
      
      // Check for timeout or network errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('NSE server connection timed out. Please try again after some time.');
      } else if (error.response?.status === 0 || !error.response) {
        toast.error('Unable to connect to NSE server. Please check your connection and try again.');
      } else if (error.response?.data?.msg?.message) {
        // Handle specific NSE error messages
        const errorMessage = error.response.data.msg.message;
        handleNseErrorMessages(errorMessage);
      } else {
        toast.error('NSE server is currently unavailable. Please try again later.');
      }
      
      setLoginStatus('');
    }
  };

  const handleNseErrorMessages = (errorMessage: string) => {
    const errorCode = errorMessage.match(/^\d+/)?.[0];
    
    switch (errorCode) {
      case '701':
        toast.error('Invalid login credentials. Please check your member code, login ID, and password.');
        break;
      case '702':
        toast.error('Your account has been disabled. Please contact your administrator.');
        break;
      case '703':
        toast.error('Invalid member code or login ID. Please verify your credentials.');
        break;
      case '704':
        toast.error('You are not eligible to access this segment. Please contact support.');
        break;
      default:
        toast.error(errorMessage || 'NSE authentication failed. Please try again.');
    }
  };

const finalizeLogin = async (nseResponseCode: number) => {
  try {
    setLoginStatus('Completing login process...');
    
    const response = await authService.completeLoginProcess(loginId, password, nseResponseCode);

    if (response.ResponseCode === 200) {
      setLoginStatus('Login successful! Checking configurations...');
      toast.success('Login successful!');

      // Check selected configurations
      try {
        const configData = await getSelectedConfigurations();

        if (configData && Object.keys(configData).length > 0) {
          setLoginStatus('Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          setLoginStatus('Redirecting to file configuration setup...');
          setTimeout(() => {
            router.push('/file-config');
          }, 1000);
        }
      } catch (configError) {
        console.error('Error checking configuration:', configError);
        toast.error('Configuration check failed. Redirecting to file configuration setup...');
        setTimeout(() => {
          router.push('/file-config');
        }, 1000);
      }

    } else if (response.ResponseCode === 403) {
      handleSystemBlocked(response.ResponseMessage);
    } else {
      toast.error(response.ResponseMessage || 'Login completion failed');
      setLoginStatus('');
    }
  } catch (error) {
    console.error('Login completion error:', error);
    toast.error('An error occurred during login completion. Please try again.');
    setLoginStatus('');
  }
};


  const handleSystemBlocked = (message: string) => {
    setSystemBlocked(true);
    setSystemBlockMessage(message || 'System is currently unavailable. Please try again later.');
    toast.error(message || 'System is currently unavailable');
    setLoginStatus('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'rgba(17, 24, 39, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
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
            loginStatus={loginStatus}
            handleSubmit={handleSubmit}
          />
        )}
      </LoginCard>
    </div>
  );
}