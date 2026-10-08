import { AuthResponse, Todo, User } from "../types/types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:logout"));
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Ошибка ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

  getTodos: () => request<Todo[]>("/api/todos"),

  createTodo: (text: string) =>
    request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  updateTodo: (id: string, patch: { text?: string; completed?: boolean }) =>
    request<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteTodo: (id: string) =>
    request<void>(`/api/todos/${id}`, { method: "DELETE" }),

  deleteProfile: () => request<void>("/api/auth/me", { method: "DELETE" }),

  chat: (
    messages: { role: "user" | "assistant" | "system"; content: string }[],
  ) =>
    request<{ reply: string; actions: { type: string; text: string }[] }>(
      "/api/ai/chat",
      { method: "POST", body: JSON.stringify({ messages }) },
    ),
};
