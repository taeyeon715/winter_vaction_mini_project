"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: { [email: string]: { password: string; user: User } } = {
  "demo@vhub.kr": {
    password: "demo1234",
    user: {
      id: "1",
      name: "김봉사",
      email: "demo@vhub.kr",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("vhub_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem("vhub_user", JSON.stringify(demoUser.user));
      return true;
    }

    // Check registered users
    const registeredUsers = JSON.parse(
      localStorage.getItem("vhub_registered_users") || "{}"
    );
    const registeredUser = registeredUsers[email];
    if (registeredUser && registeredUser.password === password) {
      setUser(registeredUser.user);
      localStorage.setItem("vhub_user", JSON.stringify(registeredUser.user));
      return true;
    }

    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if email already exists
    if (DEMO_USERS[email]) {
      return false;
    }

    const registeredUsers = JSON.parse(
      localStorage.getItem("vhub_registered_users") || "{}"
    );
    if (registeredUsers[email]) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    registeredUsers[email] = { password, user: newUser };
    localStorage.setItem(
      "vhub_registered_users",
      JSON.stringify(registeredUsers)
    );
    setUser(newUser);
    localStorage.setItem("vhub_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vhub_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
