import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeDataset: string;
  setActiveDataset: (id: string) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (fullName: string, email: string, pass: string, role?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDataset, setActiveDataset] = useState<string>('ds_default_products');

  useEffect(() => {
    const savedToken = localStorage.getItem('recolab_token');
    const savedUser = localStorage.getItem('recolab_user');
    const savedDs = localStorage.getItem('recolab_active_dataset');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('recolab_user');
      }
    } else {
      // Set default demo guest user
      const defaultUser: User = {
        id: 'usr_demo_analyst',
        email: 'analyst@recolab.io',
        full_name: 'Sarah Miller (Data Scientist)',
        role: 'Data Analyst',
        is_active: true,
        created_at: new Date().toISOString()
      };
      setUser(defaultUser);
    }
    if (savedDs) {
      setActiveDataset(savedDs);
    }
    setIsLoading(false);
  }, []);

  const handleSetActiveDataset = (id: string) => {
    setActiveDataset(id);
    localStorage.setItem('recolab_active_dataset', id);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/login', { email, password: pass });
      const { access_token, refresh_token, user: loggedUser } = res.data;
      localStorage.setItem('recolab_token', access_token);
      localStorage.setItem('recolab_refresh_token', refresh_token);
      localStorage.setItem('recolab_user', JSON.stringify(loggedUser));
      setToken(access_token);
      setUser(loggedUser);
      toast.success(`Welcome back, ${loggedUser.full_name}`);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
      return false;
    }
  };

  const register = async (fullName: string, email: string, pass: string, role = 'Data Analyst'): Promise<boolean> => {
    try {
      const res = await apiClient.post('/auth/register', {
        full_name: fullName,
        email,
        password: pass,
        role
      });
      const { access_token, refresh_token, user: newUser } = res.data;
      localStorage.setItem('recolab_token', access_token);
      localStorage.setItem('recolab_refresh_token', refresh_token);
      localStorage.setItem('recolab_user', JSON.stringify(newUser));
      setToken(access_token);
      setUser(newUser);
      toast.success('Account created successfully!');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('recolab_token');
    localStorage.removeItem('recolab_refresh_token');
    localStorage.removeItem('recolab_user');
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activeDataset,
        setActiveDataset: handleSetActiveDataset,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
