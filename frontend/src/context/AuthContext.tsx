import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'worker';
  phone?: string;
  profileImage?: string;
  isApproved?: boolean;
  isProfileCompleted?: boolean;
  stripeAccountId?: string;
  stripeOnboardingCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginState: (userData: User, accessToken: string) => void;
  logoutState: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('gigsoUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('gigsoUser');
      }
    }
    return null;
  });
  const [isLoading] = useState(false);

  const loginState = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('gigsoUser', JSON.stringify(userData));
  };

  const logoutState = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('gigsoUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginState, logoutState, logout: logoutState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
