import { createContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: "admin" | "user";
  isAdmin?: boolean;
  tests?: any[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isInitialized: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserStr = localStorage.getItem("user");

      if (storedToken && storedUserStr) {
        const parsedUser: User = JSON.parse(storedUserStr);
        if (parsedUser?.name && parsedUser?.email) {
          setUser(parsedUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      }
    } catch (err) {
      console.warn("Invalid user session in localStorage", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    if (!newUser?.name || !newUser?.email) {
      console.error("Attempted to log in with incomplete user data", newUser);
      return;
    }
    const userWithAdmin = {
      ...newUser,
      isAdmin: Boolean(newUser.isAdmin || newUser.role === "admin"),
    };

    setToken(newToken);
    setUser(userWithAdmin);

    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userWithAdmin));
    } catch (err) {
      console.error("Error writing to localStorage", err);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (err) {
      console.error("Error clearing localStorage", err);
    }
  };

  const isAdmin = Boolean(user?.isAdmin || user?.role === "admin");

  return (
    <AuthContext.Provider value={{ user, token, isInitialized, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
