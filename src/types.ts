export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteProfile: () => Promise<void>;
}
