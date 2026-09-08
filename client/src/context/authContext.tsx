import { createContext, useState, useEffect, type ReactNode } from "react";

<<<<<<< HEAD
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
=======
interface User {
  id?: string;
  name: string;
  email: string;
  tests?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
<<<<<<< HEAD
  isInitialized: false,
  isAdmin: false,
=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
<<<<<<< HEAD
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
=======
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserStr = localStorage.getItem("user");

<<<<<<< HEAD
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
=======
      if (!storedToken || !storedUserStr) {
        // Nothing in storage — skip
        return;
      }

      const parsedUser: User = JSON.parse(storedUserStr);

      if (parsedUser?.name && parsedUser?.email) {
        setUser(parsedUser);
        setToken(storedToken);
      } else {
        console.warn("User data incomplete in localStorage. Clearing...");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.warn("Invalid user data in localStorage. Clearing...", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    if (!newUser?.name || !newUser?.email) {
      console.error("Attempted to log in with incomplete user data", newUser);
      return;
    }
<<<<<<< HEAD
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
=======
    setToken(newToken);
    setUser(newUser);

    // Store safely
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  };

  const logout = () => {
    setToken(null);
    setUser(null);
<<<<<<< HEAD
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
=======
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
      {children}
    </AuthContext.Provider>
  );
};
