import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth, PREDEFINED_ACCOUNTS } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ShieldAlert,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Radio,
  Users,
  Building,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  ClipboardList,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, register, currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('CITIZEN');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Destination after login
  const from = (location.state as any)?.from;

  // Smart routing: redirect user to their primary role console or the page they requested
  const redirectUserByRole = (role: UserRole) => {
    if (from && from !== '/' && from !== '/login') {
      navigate(from, { replace: true });
      return;
    }
    switch (role) {
      case 'AUTHORITY':
        navigate('/authority', { replace: true });
        break;
      case 'RESCUE_TEAM':
        navigate('/rescue', { replace: true });
        break;
      case 'ADMIN':
        navigate('/admin', { replace: true });
        break;
      case 'CITIZEN':
      default:
        navigate('/', { replace: true });
        break;
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessNotice('');
    setIsSubmitting(true);

    try {
      const success = await login(loginEmail, loginPassword);
      setIsSubmitting(false);
      if (success) {
        setLoginSuccessNotice('Authentication verified. Redirecting to console...');
        // Find role of logged in account
        const normalized = loginEmail.trim().toLowerCase();
        const account = PREDEFINED_ACCOUNTS.find((u) => u.email.toLowerCase() === normalized);
        const role = account ? account.role : 'CITIZEN';
        setTimeout(() => {
          redirectUserByRole(role);
        }, 500);
      } else {
        setLoginError('Invalid email or password. Use the 1-Click Fast Login buttons above or check the demo credentials on the right.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setLoginError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phoneNumber: regPhone,
      });
      setIsSubmitting(false);
      setRegSuccess(`Account for ${regName} created successfully! Signing in...`);
      setTimeout(() => {
        redirectUserByRole(regRole);
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setRegError(err.message || 'Registration failed.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    quickLogin(role);
    redirectUserByRole(role);
  };

  const handleFillCredentials = (email: string, password: string) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setLoginError('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-xl shadow-red-600/30 mx-auto">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          DisasterGuard India Access Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Role-Based Access Control (RBAC) authentication for Indian emergency management, disaster response command, field rescue units, and citizens.
        </p>
      </div>

      {/* Notice if redirected from a protected route */}
      {from && (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4 text-xs text-amber-200 flex items-start gap-3 shadow-lg">
          <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-white">Authentication Required for {from}</div>
            <p className="text-slate-300 mt-0.5">
              You attempted to access a secured operations console. Please sign in below or use one of the 1-click verified roles.
            </p>
          </div>
        </div>
      )}

      {/* If already authenticated notice */}
      {isAuthenticated && currentUser && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs text-slate-400">Currently Authenticated:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentUser.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{currentUser.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => redirectUserByRole(currentUser.role)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
            >
              Continue to {currentUser.role === 'AUTHORITY' ? 'Control Room' : currentUser.role === 'RESCUE_TEAM' ? 'Rescue Console' : currentUser.role === 'ADMIN' ? 'Admin Panel' : 'Emergency Portal'}
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* 1-Click Fast Login Banner for Testing / Evaluation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>⚡ 1-Click Instant Sign-In for Evaluators</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Switch identities instantly with pre-verified RBAC security tokens
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {PREDEFINED_ACCOUNTS.map((acc) => {
            const isCurrent = currentUser?.role === acc.role;
            return (
              <button
                key={acc.userId}
                onClick={() => handleQuickLogin(acc.role)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 group ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50'
                    : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                      {acc.role}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white text-xs mt-1.5 truncate group-hover:text-blue-400 transition">
                    {acc.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{acc.email}</div>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Sign In as {acc.role.split('_')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Login / Register Form */}
        <div className="md:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Email & Password)
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register (New RBAC Account)
            </button>
          </div>

          {activeTab === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{loginSuccessNotice}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Registered Email Address</label>
                  <span className="text-[10px] text-slate-400">e.g. authority@disasterguard.in</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Password</label>
                  <span className="text-[10px] text-slate-400">Demo format: Role@123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick autofill helper chips */}
              <div className="pt-1">
                <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                  <ClipboardList className="w-3 h-3 text-slate-400" />
                  <span>Click to Auto-Fill Credentials:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.userId}
                      type="button"
                      onClick={() => handleFillCredentials(acc.email, acc.passwordHash)}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-750 hover:border-slate-600 text-[10px] text-slate-300 font-semibold transition hover:text-white"
                    >
                      {acc.role.split('_')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{isSubmitting ? 'Authenticating Identity...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              {regError && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name & Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Officer Sunita Rao (BMC Ward Desk)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official or Personal Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="user@disasterguard.in"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Security Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-white focus:outline-none focus:border-blue-500 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone (+91)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98200 XXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Operational Role (RBAC)</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-blue-500 text-xs"
                >
                  <option value="CITIZEN">Citizen (Report hazards, SOS beacon, shelter finder)</option>
                  <option value="AUTHORITY">Control-Room Operator (Triage, team dispatch, emergency alerts)</option>
                  <option value="RESCUE_TEAM">Field Responder (Mission tickets, rescue verification)</option>
                  <option value="ADMIN">System Administrator (Full governance & configuration)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Account...' : 'Create Account & Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Evaluator Credentials Directory & Fast Fill */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Verified Test Credentials</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use these standard identities to test role-based access, triage dispatch, and emergency operations:
            </p>

            <div className="space-y-3 pt-1">
              {PREDEFINED_ACCOUNTS.map((acc) => (
                <div
                  key={acc.userId}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs truncate">{acc.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{acc.email}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                      {acc.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Password:</span>
                    <span className="font-mono text-emerald-400 font-bold">{acc.passwordHash}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleFillCredentials(acc.email, acc.passwordHash)}
                      className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[11px] border border-slate-700 transition text-center"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin(acc.role)}
                      className="py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition text-center"
                    >
                      Instant Sign In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
