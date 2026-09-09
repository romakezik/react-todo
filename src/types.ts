export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  deleteProfile: () => void;
}
