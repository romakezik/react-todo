import type { Database } from "./database.types";

export type Todo = Database["public"]["Tables"]["todos"]["Row"];
export type AuthResponse = { user: User; token: string };
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteProfile: () => Promise<void>;
}
