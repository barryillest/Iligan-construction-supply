import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const extractErrorMessage = (error, fallbackMessage) => {
  if (error?.response) {
    const { data, statusText } = error.response;
    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (statusText) {
      return statusText;
    }
  }
  if (error?.message) {
    return error.message;
  }
  return fallbackMessage;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`,
        { email, password, name }
      );

      const { token: authToken, user } = response.data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      toast.success(`Welcome, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      const message = extractErrorMessage(error, 'Registration failed');
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`,
        { email, password }
      );

      const { token: authToken, user } = response.data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      const message = extractErrorMessage(error, 'Login failed');
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`,
        { token: googleToken }
      );

      const { token: authToken, user } = response.data;

      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user };
    } catch (error) {
      console.error('Google login error:', error);
      const message = extractErrorMessage(error, 'Login failed');
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
