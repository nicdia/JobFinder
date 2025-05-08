// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: number;
  name: string;
  token: string;
}

interface AuthContextProps {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  postLoginRedirect: string | null;
  setPostLoginRedirect: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(
    null
  );

  const login = (userData: User) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, postLoginRedirect, setPostLoginRedirect }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
