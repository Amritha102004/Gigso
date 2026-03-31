import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define User shape conservatively matching gigso backend responses
export interface User {
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'worker';
  isApproved?: boolean;
  isProfileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginState: (userData: User, accessToken: string) => void;
  logoutState: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on hard reload
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('gigsoUser');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        // Invalid stored object
        localStorage.removeItem('accessToken');
        localStorage.removeItem('gigsoUser');
      }
    }
    setIsLoading(false);
  }, []);

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
    <AuthContext.Provider value={{ user, token, loginState, logoutState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
