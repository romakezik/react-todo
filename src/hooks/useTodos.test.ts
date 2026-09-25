import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useTodos from "./useTodos";
import { todo, query, ok, fail } from "../test/helpers";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));
vi.mock("../lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

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

  it("toggle откатывает изменения при ошибке сервера", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "Молоко")]));
    mockFrom.mockReturnValueOnce(fail("-сеть"));

    const { result } = renderHook(() => useTodos("u1"));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    await act(async () => {
      await result.current.toggleTodo("1");
    });

    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.actionError).toBe("-сеть");
    expect(result.current.pendingId).toBeNull();
  });

  it("ошибка загрузки в error", async () => {
    mockFrom.mockReturnValueOnce(fail("fetch failed"));

    const { result } = renderHook(() => useTodos("u1"));
    await waitFor(() => expect(result.current.error).toBe("fetch failed"));
    expect(result.current.actionError).toBeNull();
    expect(result.current.todos).toHaveLength(0);
  });

  it("второй toggle игнорируется", async () => {
    mockFrom.mockReturnValueOnce(ok([todo("1", "moloko", false)]));

    let resolveToggle!: (v: { data: unknown; error: unknown }) => void;
    const answer = new Promise<{ data: unknown; error: unknown }>((resolve) => {
      resolveToggle = resolve;
    });
    mockFrom.mockReturnValueOnce(query(answer));

    const { result } = renderHook(() => useTodos("u1"));
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    act(() => {
      result.current.toggleTodo("1");
    });
    expect(result.current.pendingId).toBe("1");
    expect(result.current.todos[0].completed).toBe(true);

    act(() => {
      result.current.toggleTodo("1");
    });
    expect(result.current.pendingId).toBe("1");
    expect(result.current.todos[0].completed).toBe(true);

    expect(mockFrom).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveToggle({ data: todo("1", "moloko", true), error: null });
    });
    await waitFor(() => expect(result.current.pendingId).toBeNull());
    expect(result.current.todos[0].completed).toBe(true);
  });
});
