import { JSX, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import { User } from "../types/types";
import { api } from "../lib/api";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = async (email: string, password: string) => {
    const { user, token } = await api.login(email, password);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user, token } = await api.register(email, password, name);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const deleteProfile = async () => {
    if (!user) return;
    // сделть роут DELETE /api/auth/me
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, deleteProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
