import { useState } from "react";
import { AuthContext } from "../hooks/useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function readUsers() {
    try {
      const raw = localStorage.getItem("users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  const login = (email, password) => {
    const users = readUsers();

    const user = users.find((u) => u.email === email);

    if (!user) throw new Error("Пользователь с таким email не найден");

    if (user.password !== password) throw new Error("Неверный пароль");

    const userData = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = (name, email, password) => {
    let users = readUsers();

    const userExists = users.some((user) => user.email === email);

    if (userExists) {
      throw new Error("Этот email уже зарегистрирован");
    }

    let newUser = {
      id: crypto.randomUUID(),
      name: name,
      email: email,
      password: password,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    const userData = {
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
    const users = readUsers();
    const updatedUsers = users.filter((u) => u.id !== user.id);
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
