import type { Todo } from "../types/types";

export const todo = (id: string, text: string, completed = false): Todo => ({
  id,
  text,
  completed,
  user_id: "u1",
  created_at: "2026-09-22T00:00:00Z",
});

export function query(answer: Promise<{ data: unknown; error: unknown }>) {
  const q: Record<string, unknown> = {
    select: () => q,
    order: () => q,
    eq: () => q,
    single: () => q,
    insert: () => q,
    update: () => q,
    delete: () => q,
  };
  q.then = (resolve: (v: unknown) => unknown) => answer.then(resolve);
  return q;
}

export const ok = (data: unknown) =>
  query(Promise.resolve({ data, error: null }));
export const fail = (message: string) =>
  query(Promise.resolve({ data: null, error: { message } }));
