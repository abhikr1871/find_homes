import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginApi, logoutApi } from '../api/auth';
import type { LoginResponse } from '../api/auth';

interface AuthContextType {
  user: LoginResponse['user'] | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);

  useEffect(() => {
    // Restore session on page refresh (Assignment requirement)
    const token = localStorage.getItem('ivy_token');
    const savedUser = localStorage.getItem('ivy_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ivy_token');
        localStorage.removeItem('ivy_user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    // Remember: we found out the API returns 'access_token', not 'token'
    localStorage.setItem('ivy_token', data.access_token);
    localStorage.setItem('ivy_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      console.error("Logout API failed, but clearing local session anyway.");
    }
    localStorage.removeItem('ivy_token');
    localStorage.removeItem('ivy_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
