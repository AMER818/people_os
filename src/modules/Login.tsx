import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { sanitizeInput } from '../utils/security';
import { api } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const safeUsername = sanitizeInput(username);
    const safePassword = sanitizeInput(password);

    try {
      const loginSuccess = await api.login(safeUsername, safePassword, false);

      if (loginSuccess) {
        setSuccess(true);
        // Quick success animation then proceed
        setTimeout(() => {
          onLogin();
        }, 200);
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-app z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      <div
        className={`
                relative z-10 max-w-md w-full 
                bg-surface backdrop-blur-xl border border-white/20 shadow-2xl 
                rounded-3xl p-8 md:p-10
                animate-in zoom-in-95 fade-in duration-500
            `}
      >
        <div className="text-center mb-10">
          <div className="group relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
            <div className="absolute inset-0 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
              <Lock className="text-white w-10 h-10" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-text-muted font-medium">
            Enter your credentials to access{' '}
            <span className="text-primary font-bold">People OS</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 group">
            <label className="text-xs font-black text-text-secondary uppercase tracking-widest ml-1 transition-colors group-focus-within:text-primary">
              Username
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-4 pl-12 pr-4 text-text-primary font-bold placeholder:text-text-muted/50 outline-none transition-all"
                placeholder="sysadmin"
                aria-label="Username"
                disabled={loading || success}
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-text-secondary uppercase tracking-widest transition-colors group-focus-within:text-primary">
                Password
              </label>
              <a
                href="#"
                className="text-xs font-bold text-primary hover:text-primary-hover hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl py-4 pl-12 pr-4 text-text-primary font-bold placeholder:text-text-muted/50 outline-none transition-all"
                placeholder="••••••••"
                aria-label="Password"
                disabled={loading || success}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`
                            relative w-full py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg overflow-hidden
                            transition-all duration-300
                            ${
                              success
                                ? 'bg-green-500 text-white shadow-green-500/25 scale-[1.02]'
                                : 'bg-primary text-white shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                            }
                            ${loading ? 'cursor-wait opacity-90' : ''}
                        `}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={20} className="animate-in zoom-in spin-in-90" />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <span>Sign In Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted font-medium">
            Protected by <span className="text-primary font-bold">PeopleOS Security™</span>
            <span className="mx-2 opacity-50">•</span>v{import.meta.env.VITE_APP_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
