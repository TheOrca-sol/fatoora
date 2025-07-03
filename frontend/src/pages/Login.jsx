import React, { useState } from 'react';
import { auth, googleProvider, appleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Chrome, Apple, Mail, Lock, ArrowRight } from 'lucide-react';

function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem('jwt', token);
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span className="text-3xl">🧾</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Fatoora</h1>
            <p className="text-blue-100">Your smart invoice management solution</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="space-y-4">
              <button
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group"
                onClick={() => handleLogin(googleProvider)}
                disabled={loading}
              >
                <Chrome className="h-5 w-5 text-red-500" />
                <span>Continue with Google</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                onClick={() => handleLogin(appleProvider)}
                disabled={loading}
              >
                <Apple className="h-5 w-5" />
                <span>Continue with Apple</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-red-700 text-sm font-medium">Authentication Error</p>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium">Signing you in...</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="h-4 w-4" />
                <span>Secure authentication powered by Firebase</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
            <p className="text-xs font-medium text-gray-700">Analytics</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 text-sm">⚡</span>
            </div>
            <p className="text-xs font-medium text-gray-700">Fast Setup</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 text-sm">🔒</span>
            </div>
            <p className="text-xs font-medium text-gray-700">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 