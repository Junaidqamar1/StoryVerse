import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, removeToken, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Keep in sync with localStorage
    const currentToken = getToken();
    const currentUser = getUser();
    setTokenState(currentToken);
    setUserState(currentUser);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      setTokenState(res.token);
      setUserState(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await registerUser(email, password);
      setTokenState(res.token);
      setUserState(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
