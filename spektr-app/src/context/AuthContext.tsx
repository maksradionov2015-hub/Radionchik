import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Role } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  age: number;
  gender?: string;
  email: string;
  phone?: string;
  password?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock-данные для демонстрации
const mockUser: User = {
  id: 'user-1',
  name: 'Алексей',
  age: 28,
  isMinor: false,
  gender: 'male',
  email: 'alex@example.com',
  role: 'USER',
  tokenBalance: 150,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохранённую сессию
    const storedUser = localStorage.getItem('spektr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      // В реальности здесь будет вызов API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock-логин для демонстрации
      const loggedInUser = { ...mockUser, email };
      setUser(loggedInUser);
      localStorage.setItem('spektr_user', JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      // В реальности здесь будет вызов API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        age: data.age,
        isMinor: data.age < 18,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        role: 'USER',
        tokenBalance: 0,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('spektr_user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('spektr_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
