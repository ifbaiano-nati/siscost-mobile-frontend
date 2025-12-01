import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User } from '@/types/user';


interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('@siscost:token');
      const storedUser = await AsyncStorage.getItem('@siscost:user');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true); // ✅ Set as boolean true
        
        // Opcionalmente, verificar token com backend
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch (error) {
          // Token inválido, fazer logout
          await logout();
        }
      } else {
        setIsAuthenticated(false); // ✅ Set as boolean false
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
      setIsAuthenticated(false); // ✅ Set as boolean false
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const { user: userData, token } = await api.login(email, password);
      
      setUser(userData);
      setIsAuthenticated(true); // ✅ Set as boolean true
      
      // Token e user já são salvos no api.login
    } catch (error: any) {
      setIsAuthenticated(false); // ✅ Set as boolean false
      throw error;
    }
  }

  async function register(data: any) {
    try {
      await api.register(data);
      
      // Após registro, fazer login automático
      await login(data.email, data.password);
    } catch (error: any) {
      throw error;
    }
  }

  async function logout() {
    try {
      await AsyncStorage.multiRemove(['@siscost:token', '@siscost:user']);
      setUser(null);
      setIsAuthenticated(false); // ✅ Set as boolean false
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
      }}
    >
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