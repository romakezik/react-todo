import { JSX, ReactNode, useState } from "react";
import { AuthContext } from "../hooks/useAuth";
import { StoredUser, User } from "../types";

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw: string | null = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function readUsers(): StoredUser[] {
    try {
      const raw: string | null = localStorage.getItem("users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  const login = (email: string, password: string) => {
    const users: StoredUser[] = readUsers();

    const user: StoredUser | undefined = users.find((u) => u.email === email);

    if (!user) throw new Error("Пользователь с таким email не найден");

    if (user.password !== password) throw new Error("Неверный пароль");

    const userData: { id: string, name: string, email: string } = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = (name: string, email: string, password: string) => {
    let users: StoredUser[] = readUsers();

    const userExists: boolean = users.some((user) => user.email === email);

    if (userExists) {
      throw new Error("Этот email уже зарегистрирован");
    }

    let newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      password: password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const deleteProfile = () => {
    if (!user) return;
    const users: StoredUser[] = readUsers();
    const updatedUsers: StoredUser[] = users.filter((u) => u.id !== user.id);
    localStorage.removeItem(`todos_${user.id}`);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, deleteProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
