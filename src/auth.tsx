import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthUser {
  id: string;
  name: string;
  role: string;
  facility: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (id: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() called outside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (id: string, password: string): boolean => {
    const cleanId = id.trim();
    const cleanPw = password.trim();

    if (!cleanId) return false;

    // Password must be "ishan" (case-insensitive)
    if (cleanPw.toLowerCase() !== "ishan") {
      return false;
    }

    // Format display name from User ID
    let displayName = cleanId;
    if (cleanId.includes("@")) {
      const handle = cleanId.split("@")[0].replace(/[._-]/g, " ");
      displayName = handle
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    } else {
      displayName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
    }

    setUser({
      id: cleanId,
      name: displayName,
      role: "Lead Clinician",
      facility: "Apollo Oncology Hub · Main Campus",
    });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
