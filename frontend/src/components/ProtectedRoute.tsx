import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, Lock, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { currentUser, isAuthenticated, quickLogin } = useAuth();
  const location = useLocation();

  // 1. Not Authenticated -> Redirect to Login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Authenticated, but role not allowed
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">
            Access Restricted (RBAC Policy)
          </span>
          <h1 className="text-2xl font-black text-white">Insufficient Role Privileges</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            You are currently signed in as <strong className="text-white">{currentUser.name}</strong> with role{' '}
            <strong className="text-amber-400 font-mono">[{currentUser.role}]</strong>. This secure operations section requires authorization from:{' '}
            <strong className="text-white font-mono">[{allowedRoles.join(' or ')}]</strong>.
          </p>
        </div>

        {/* Quick Demo Switcher if in testing mode */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 text-xs text-slate-300 space-y-3 text-left">
          <div className="font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Persona Quick Switch:</span>
          </div>
          <p className="text-[11px] text-slate-400">
            For demonstration and operational evaluation, you can switch immediately to an authorized role identity:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {allowedRoles.map((role) => (
              <button
                key={role}
                onClick={() => quickLogin(role)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
              >
                Sign In as {role}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
          >
            Return to Public Portal
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
          >
            Sign in with Another Account
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authenticated & Authorized
  return <>{children}</>;
};
