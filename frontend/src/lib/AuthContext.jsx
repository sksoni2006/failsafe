import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('failsafe_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('failsafe_token'));

  const login = (accessToken) => {
    localStorage.setItem('failsafe_token', accessToken);
    setToken(accessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('failsafe_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem('failsafe_token');
    if (stored) {
      setToken(stored);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
