import { createContext, useContext, useState, type ReactNode } from "react";

type UserType = {
  id: number;
  username: string;
  role: "librarian" | "admin";
};

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  login: (user: UserType, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    return null;
  });

  // We can keep isLoading if we want to support async checks later,
  // but for now it's always false since we load synchronously from localStorage.
  const [isLoading] = useState(false);

  const login = (userData: UserType, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
