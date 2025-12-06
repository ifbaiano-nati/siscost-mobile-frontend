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
  // O loading controla o estado inicial de leitura do AsyncStorage (importante para o splash)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedToken = await AsyncStorage.getItem('@siscost:token');
      const storedUser = await AsyncStorage.getItem('@siscost:user');

      if (storedToken && storedUser) {
        // O 'parsedUser' é um estado intermediário que logo será substituído pelo getMe()
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Garante que o perfil completo seja lido do backend para o MainNavigator
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch (error) {
          // Token inválido ou expirado, força o logout
          await logout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  // 🚨 CORREÇÃO CRÍTICA DO FLUXO DE LOGIN MANUAL 🚨
  async function login(email: string, password: string) {
    try {
      // 1. Faz o login inicial e salva o token
      const response = await api.login(email, password);

      // 2. BUSCA IMEDIATA: Puxa o objeto User completo (com user_profile.profile.name)
      // Isso garante que o MainNavigator leia o perfil correto (Pesquisador ou Turista).
      const currentUser = await api.getMe();

      setUser(currentUser); // Atualiza o estado com o objeto de perfil completo
      setIsAuthenticated(true);

      // Nota: A função api.login deve garantir que o novo token foi setado no Axios Interceptor

    } catch (error: any) {
      setIsAuthenticated(false);
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
      setIsAuthenticated(false);
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