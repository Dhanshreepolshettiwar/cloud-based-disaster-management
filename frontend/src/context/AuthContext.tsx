import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export interface StoredAccount extends User {
  passwordHash: string; // Plaintext or simulated hash for demo
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  register: (data: { name: string; email: string; password: string; role: UserRole; phoneNumber?: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  registeredUsers: StoredAccount[];
}

export const PREDEFINED_ACCOUNTS: StoredAccount[] = [
  {
    userId: 'usr-cit-001',
    name: 'Dhanshree Patil (Citizen)',
    email: 'citizen@disasterguard.in',
    role: 'CITIZEN',
    phoneNumber: '+91 98200 11223',
    passwordHash: 'Citizen@123',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    userId: 'usr-auth-002',
    name: 'Commander Sharma (BMC Control Room)',
    email: 'authority@disasterguard.in',
    role: 'AUTHORITY',
    phoneNumber: '+91 22 2269 4719',
    passwordHash: 'Control@123',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    userId: 'usr-res-003',
    name: 'Inspector Rawat (NDRF 5th Battalion)',
    email: 'responder@disasterguard.in',
    role: 'RESCUE_TEAM',
    phoneNumber: '+91 22 2847 0011',
    passwordHash: 'Responder@123',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    userId: 'usr-adm-004',
    name: 'National Disaster System Administrator',
    email: 'admin@disasterguard.in',
    role: 'ADMIN',
    phoneNumber: '+91 11 2670 1700',
    passwordHash: 'Admin@123',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stored registered accounts - ensure predefined accounts are always available
  const [registeredUsers, setRegisteredUsers] = useState<StoredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('disaster_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge to ensure predefined accounts are never missing
          const existingEmails = new Set(parsed.map((p: StoredAccount) => p.email.toLowerCase()));
          const missingPredefined = PREDEFINED_ACCOUNTS.filter(
            (p) => !existingEmails.has(p.email.toLowerCase())
          );
          return [...parsed, ...missingPredefined];
        }
      }
    } catch {
      // fallback
    }
    return PREDEFINED_ACCOUNTS;
  });

  // Current session user - check saved session; if none, default to null (guest citizen)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('disaster_auth_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.userId && parsed.role) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  const isAuthenticated = currentUser !== null;

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('disaster_auth_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('disaster_auth_session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('disaster_registered_accounts', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check both registeredUsers and PREDEFINED_ACCOUNTS
    const allAccounts = [
      ...registeredUsers,
      ...PREDEFINED_ACCOUNTS.filter(
        (p) => !registeredUsers.some((r) => r.email.toLowerCase() === p.email.toLowerCase())
      ),
    ];

    const account = allAccounts.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        (u.passwordHash === cleanPassword ||
          u.passwordHash.toLowerCase() === cleanPassword.toLowerCase())
    );

    if (account) {
      const { passwordHash, ...safeUser } = account;
      setCurrentUser(safeUser);
      return true;
    }
    return false;
  };

  const quickLogin = (role: UserRole) => {
    const account =
      registeredUsers.find((u) => u.role === role) ||
      PREDEFINED_ACCOUNTS.find((u) => u.role === role);
    if (account) {
      const { passwordHash, ...safeUser } = account;
      setCurrentUser(safeUser);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phoneNumber?: string;
  }): Promise<boolean> => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address is already registered.');
    }

    const newAccount: StoredAccount = {
      userId: `usr-${data.role.toLowerCase()}-${Date.now().toString(36)}`,
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role,
      phoneNumber: data.phoneNumber || '+91 98000 00000',
      passwordHash: data.password.trim(),
      createdAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newAccount, ...prev]);

    const { passwordHash, ...safeUser } = newAccount;
    setCurrentUser(safeUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('disaster_auth_session');
  };

  const updateUser = (data: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        quickLogin,
        register,
        logout,
        updateUser,
        registeredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
