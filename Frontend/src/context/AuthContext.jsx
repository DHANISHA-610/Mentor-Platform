import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'mentor_platform_token';
const API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  // Function to load the user profile from the backend using the token
  const loadUser = async (token) => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    if (token) {
      loadUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
