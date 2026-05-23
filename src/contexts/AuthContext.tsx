import { createContext, useState, useCallback, ReactNode } from 'react';
import { User } from '../types';
import {
  getCurrentUser,
  loginUser as storeLogin,
  logoutUser as storeLogout,
  registerUser as storeRegister,
} from '../store/store';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser);

  const login = useCallback((email: string, password: string) => {
    const result = storeLogin(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    const newUser: User = {
      id: uuidv4(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };
    const result = storeRegister(newUser);
    if (result.success) {
      storeLogin(email, password);
      setUser(newUser);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
