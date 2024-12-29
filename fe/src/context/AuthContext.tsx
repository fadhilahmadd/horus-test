import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Define the type for the AuthContext
type AuthContextType = {
  auth: string | null;
  login: (token: string) => void;
  logout: () => void;
};

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<string | null>(() => localStorage.getItem('token'));

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setAuth(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  // Use useMemo to memoize the value
  const value = useMemo(() => ({ auth, login, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
