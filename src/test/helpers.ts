import type { Todo } from "../types/types";

export const todo = (id: string, text: string, completed = false): Todo => ({
  id,
  text,
  completed,
  user_id: "u1",
  created_at: "2026-10-02T00:00:00Z",
});