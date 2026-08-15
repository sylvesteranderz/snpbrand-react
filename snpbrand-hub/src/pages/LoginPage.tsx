import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [signingIn, setSigningIn] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { user, role, loading, error: authError, setError: setAuthError, checkSession } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect straight to orders page
  useEffect(() => {
    if (!loading && user && (role === 'hub_partner' || role === 'admin')) {
      navigate('/orders', { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSigningIn(true);
    setLocalError(null);
    setAuthError(null);

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInErr) {
        throw new Error(signInErr.message);
      }

      // Explicitly trigger a profile and session check in the auth provider
      await checkSession();
    } catch (err: any) {
      console.error('Login request failed:', err);
      setLocalError(err.message || 'Incorrect email or password.');
      setSigningIn(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-6">
      <div className="w-full space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto border border-primary-100 shadow-inner">
            <span className="text-2xl">📦</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">SNP BRAND</h1>
            <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-0.5">
              Accra & Kumasi Hubs
            </p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {displayedError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-start space-x-2 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
              <span className="font-medium">{displayedError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="partner@snpbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={signingIn}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={signingIn}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={signingIn || loading}
            className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold rounded-xl text-base shadow-sm hover:shadow active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 min-h-[48px]"
          >
            {signingIn ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-wider">
          Authorized personnel only • Invite-only access
        </p>
      </div>
    </div>
  );
};
