import React from 'react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  loginId: string;
  setLoginId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoggingIn: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  loginId,
  setLoginId,
  password,
  setPassword,
  isLoggingIn,
  handleSubmit,
}: LoginFormProps) {
  return (
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
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Logging in...
            </div>
          ) : (
            'Log In'
          )}
        </motion.button>
      </div>
    </form>
  );
}