import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { apiSignUp, apiSignIn, apiSignOut, apiGetMe, hasToken, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }
    apiGetMe()
      .then(({ user }) => setUser(user))
      .catch(() => apiSignOut())
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { user } = await apiSignUp(email, password, fullName);
    setUser(user);
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await apiSignIn(email, password);
    setUser(user);
  };

  const signOut = () => {
    apiSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
