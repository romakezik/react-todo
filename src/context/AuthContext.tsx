import { JSX, ReactNode, useEffect, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import { User } from "../types/types";
import { supabase } from "../lib/supabase";

function toUser(su: {
  id: string;
  email?: string | null;
  user_metadata?: { name?: string } | null;
}): User {
  return {
    id: su.id,
    email: su.email ?? "",
    name: su.user_metadata?.name ?? "",
  };
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session ? toUser(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
  };

  const register = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const deleteProfile = async () => {
    if (!user) return;
    const { error } = await supabase.rpc("delete_own_account");
    if (error) throw new Error(error.message);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, deleteProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
