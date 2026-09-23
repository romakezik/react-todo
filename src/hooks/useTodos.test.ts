import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Todo } from "../types/types";
import useTodos from "./useTodos";

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));
vi.mock("../lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

const todo = (id: string, text: string, completed = false): Todo => ({
  id,
  text,
  completed,
  user_id: "u1",
  created_at: "2026-09-22T00:00:00Z",
});

function query(answer: Promise<{ data: unknown; error: unknown }>) {
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
const ok = (data: unknown) => query(Promise.resolve({ data, error: null }));

describe("useTodos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("загружает список при монтировании", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко")]));

    const { result } = renderHook(() => useTodos("u1"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("toggle меняет состояние ДО ответа сервера", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко", false)]));

    let resolveToggle!: (v: { data: unknown; error: unknown }) => void;
    const answer = new Promise<{ data: unknown; error: unknown }>((res) => {
      resolveToggle = res;
    });
    mockFrom.mockReturnValueOnce(query(answer));

    console.log(answer)
    const { result } = renderHook(() => useTodos("u1"));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    act(() => {
      result.current.toggleTodo("1");
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.pendingId).toBe("1");

    await act(async () => {
      resolveToggle({ data: todo("1", "Молоко", true), error: null });
    });
    await waitFor(() => expect(result.current.pendingId).toBeNull());
    expect(result.current.todos[0].completed).toBe(true);
  });
});
