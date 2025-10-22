import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('🔍 Checking auth...');
      console.log('Token:', token ? 'EXISTS' : 'MISSING');
      console.log('Saved User:', savedUser ? 'EXISTS' : 'MISSING');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          
          console.log('✅ Setting user from localStorage:', userData);
          
          setUser(userData);
          setIsAuthenticated(true);
          
          try {
            const response = await authAPI.getMe();
            console.log('✅ Token verified with backend');
            setUser(response.data.data);
          } catch (verifyError) {
            console.error('❌ Token verification failed:', verifyError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('❌ Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No token or user found in localStorage');
      }
      
      console.log('🏁 Setting loading to false');
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      console.log('🔍 Full response:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response data.data:', response.data.data);
      
      // Backend returns "accessToken" not "token"
      const { accessToken, user: userData } = response.data.data;
      const token = accessToken;
      
      console.log('🔍 Extracted token:', token);
      console.log('🔍 Extracted user:', userData);

      if (!token || token === 'undefined') {
        console.error('❌ Token is undefined or invalid!');
        return {
          success: false,
          message: 'Invalid token received from server'
        };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login successful! Token saved:', token);

      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password });
      
      console.log('🔍 Full response:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response data.data:', response.data.data);
      
      // Backend returns "accessToken" not "token"
      const { accessToken, user: userData } = response.data.data;
      const token = accessToken;
      
      console.log('🔍 Extracted token:', token);
      console.log('🔍 Extracted user:', userData);

      if (!token || token === 'undefined') {
        console.error('❌ Token is undefined or invalid!');
        return {
          success: false,
          message: 'Invalid token received from server'
        };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Registration successful! Token saved:', token);

      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('✅ Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};