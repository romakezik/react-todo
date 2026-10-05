import { AuthResponse, Todo, User } from "../types/types";

const BASE_URL = "https://todo-server-production-d9dd.up.railway.app";

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
  register: (
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (): Promise<User> => request<User>("/api/auth/me"),

  getTodos: (): Promise<Todo[]> => request<Todo[]>("/api/todos"),

  createTodo: (text: string): Promise<Todo> =>
    request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  updateTodo: (
    id: string,
    patch: { text?: string; completed?: boolean },
  ): Promise<Todo> =>
    request<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteTodo: (id: string): Promise<void> =>
    request<void>(`/api/todos/${id}`, { method: "DELETE" }),
  
  deleteProfile: (): Promise<void> =>
    request<void>("/api/auth/me", { method: "DELETE" }),
};
