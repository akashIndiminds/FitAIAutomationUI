import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface LoginFormProps {
  loginId: string;
  setLoginId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoggingIn: boolean;
  loginStatus: string;
  handleSubmit: (e: React.FormEvent) => void;
}

interface ValidationErrors {
  loginId?: string;
  password?: string;
}

export default function LoginForm({
  loginId,
  setLoginId,
  password,
  setPassword,
  isLoggingIn,
  loginStatus,
  handleSubmit,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ loginId: false, password: false });
  const [isValid, setIsValid] = useState(false);

  // Validation logic
  const validateLoginId = (value: string): string | undefined => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return 'Login ID is required';
    if (trimmedValue.length < 3) return 'Login ID must be at least 3 characters';
    if (!/^[a-zA-Z0-9@._-]+$/.test(trimmedValue)) return 'Invalid characters in Login ID';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 3) return 'Password must be at least 3 characters';
    return undefined;
  };

  // Update validation on input change
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    
    if (touched.loginId) {
      const loginIdError = validateLoginId(loginId);
      if (loginIdError) newErrors.loginId = loginIdError;
    }
    
    if (touched.password) {
      const passwordError = validatePassword(password);
      if (passwordError) newErrors.password = passwordError;
    }
    
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0 && Boolean(loginId.trim()) && Boolean(password));
  }, [loginId, password, touched]);

  const handleLoginIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginId(value);
    if (touched.loginId) {
      setErrors(prev => ({
        ...prev,
        loginId: validateLoginId(value)
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value)
      }));
    }
  };

  const handleBlur = (field: 'loginId' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'loginId') {
      const trimmedValue = loginId.trim();
      if (trimmedValue !== loginId) {
        setLoginId(trimmedValue);
      }
      setErrors(prev => ({
        ...prev,
        loginId: validateLoginId(loginId)
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(password)
      }));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedLoginId = loginId.trim();
    setLoginId(trimmedLoginId);
    
    const finalErrors: ValidationErrors = {
      loginId: validateLoginId(trimmedLoginId),
      password: validatePassword(password)
    };
    
    const hasErrors = Object.values(finalErrors).some(error => error);
    
    if (hasErrors) {
      setErrors(finalErrors);
      setTouched({ loginId: true, password: true });
      return;
    }
    
    handleSubmit(e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Login ID Field */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="loginId" className="flex items-center text-sm font-semibold text-white/90">
            <User className="w-4 h-4 mr-2" />
            Login ID
          </label>
          <div className="relative group">
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={handleLoginIdChange}
              onBlur={() => handleBlur('loginId')}
              disabled={isLoggingIn}
              className={`w-full px-4 py-3.5 bg-white/5 backdrop-blur-sm border-2 rounded-xl 
                focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 outline-none text-white 
                placeholder-white/40 transition-all duration-300 hover:bg-white/10
                ${errors.loginId ? 'border-red-400/60' : 'border-white/20'}
                ${!errors.loginId && touched.loginId && loginId.trim() ? 'border-green-400/60' : ''}
                ${isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              placeholder="Enter your login ID"
              required
            />
            
            <AnimatePresence>
              {touched.loginId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  {errors.loginId ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : loginId.trim() ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-lg transition-opacity duration-300" />
          </div>
          
          <AnimatePresence>
            {errors.loginId && (
              <motion.p
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="text-red-400 text-xs flex items-center mt-1"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.loginId}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password Field */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="password" className="flex items-center text-sm font-semibold text-white/90">
            <Lock className="w-4 h-4 mr-2" />
            Password
          </label>
          <div className="relative group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              disabled={isLoggingIn}
              className={`w-full px-4 py-3.5 bg-white/5 backdrop-blur-sm border-2 rounded-xl 
                focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 outline-none text-white 
                placeholder-white/40 transition-all duration-300 hover:bg-white/10
                ${errors.password ? 'border-red-400/60' : 'border-white/20'}
                ${!errors.password && touched.password && password ? 'border-green-400/60' : ''}
                ${isLoggingIn ? 'opacity-60 cursor-not-allowed' : ''}
              `}
              placeholder="Enter your password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoggingIn}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-lg transition-opacity duration-300" />
          </div>
          
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="text-red-400 text-xs flex items-center mt-1"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Login Status Message */}
        <AnimatePresence>
          {loginStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 flex items-center justify-center"
            >
              <Loader2 className="w-4 h-4 mr-2 text-blue-400 animate-spin" />
              <span className="text-blue-300 text-sm font-medium">{loginStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            type="submit"
            disabled={isLoggingIn || !isValid}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white shadow-2xl transition-all duration-300
              ${isValid && !isLoggingIn 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-blue-500/25' 
                : 'bg-gray-600/50 cursor-not-allowed'
              }
            `}
            whileHover={isValid && !isLoggingIn ? { scale: 1.02, y: -2 } : {}}
            whileTap={isValid && !isLoggingIn ? { scale: 0.98 } : {}}
          >
            <AnimatePresence mode="wait">
              {isLoggingIn ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                  />
                  Signing In...
                </motion.div>
              ) : (
                <motion.span
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Form Status Indicator */}
        <AnimatePresence>
          {isValid && !isLoggingIn && !loginStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center text-green-400 text-sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Ready to sign in
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}