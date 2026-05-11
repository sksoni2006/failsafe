import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await authAPI.login(email, password);
        login(data.access_token);
        navigate('/dashboard');
      } else {
        await authAPI.register(email, password);
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] grid-texture flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb w-96 h-96 bg-blue-600/10 -top-32 -left-32" />
      <div className="orb w-80 h-80 bg-rose-600/8 bottom-0 right-0" />
      <div className="orb w-64 h-64 bg-emerald-600/6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-rose-500 mb-4 shadow-lg shadow-blue-500/20">
            <ShieldAlert size={26} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-800 text-white tracking-tight mb-1">
            FAILSAFE
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-mono uppercase tracking-widest">
            Student Success Platform
          </p>
        </div>

        {/* Card */}
        <div className="gradient-border rounded-2xl">
          <div className="glass-card rounded-2xl p-8">
            {/* Mode toggle */}
            <div className="flex bg-white/4 rounded-lg p-1 mb-7 border border-white/6">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${
                    mode === m
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Title */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-600 text-white">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {mode === 'login'
                  ? 'Sign in to your faculty account to access the dashboard.'
                  : 'Register as a faculty member to start analyzing student data.'}
              </p>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/25 mb-5 animate-scale-in">
                <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 mb-5 animate-scale-in">
                <CheckCircle size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@university.edu"
                    className="w-full bg-white/4 border border-white/8 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/4 border border-white/8 rounded-lg pl-10 pr-11 py-2.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 relative flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className="text-center text-sm text-[var(--text-muted)] mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                {mode === 'login' ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest mt-6">
          Secured · AI-Powered · Early Intervention
        </p>
      </div>
    </div>
  );
}
