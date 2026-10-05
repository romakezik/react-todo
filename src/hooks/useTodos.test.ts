import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import useTodos from "./useTodos";
import { todo } from "../test/helpers";
import type { Todo } from "../types/types";

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

vi.mock("../lib/api", () => ({ api: mockApi }));

describe("useTodos", () => {
  beforeEach(() => vi.clearAllMocks());

  it("загружает список при монтировании", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "Молоко")]);

    const { result } = renderHook(() => useTodos());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("toggle меняет состояние ДО ответа сервера", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "Молоко", false)]);

    let resolveToggle!: (v: Todo) => void;
    const answer = new Promise<Todo>((res) => {
      resolveToggle = res;
    });
    mockApi.updateTodo.mockReturnValueOnce(answer);

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    act(() => {
      result.current.toggleTodo("1");
    });

    expect(result.current.todos[0].completed).toBe(true);
    expect(result.current.pendingId).toBe("1");
    expect(mockApi.updateTodo).toHaveBeenCalledWith("1", { completed: true });

    await act(async () => {
      resolveToggle(todo("1", "Молоко", true));
    });
    await waitFor(() => expect(result.current.pendingId).toBeNull());
    expect(result.current.todos[0].completed).toBe(true);
  });

  it("toggle откатывает изменения при ошибке сервера", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "Молоко")]);
    mockApi.updateTodo.mockRejectedValueOnce(new Error("-сеть"));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    await act(async () => {
      await result.current.toggleTodo("1");
    });

    expect(result.current.todos[0].completed).toBe(false);
    expect(result.current.actionError).toBe("-сеть");
    expect(result.current.pendingId).toBeNull();
  });

  it("ошибка загрузки в error", async () => {
    mockApi.getTodos.mockRejectedValueOnce(new Error("fetch failed"));

    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.error).toBe("fetch failed"));
    expect(result.current.actionError).toBeNull();
    expect(result.current.todos).toHaveLength(0);
  });

  it("второй toggle игнорируется", async () => {
    mockApi.getTodos.mockResolvedValueOnce([todo("1", "moloko", false)]);

    let resolveToggle!: (v: Todo) => void;
    const answer = new Promise<Todo>((res) => {
      resolveToggle = res;
    });
    mockApi.updateTodo.mockReturnValueOnce(answer);

    const { result } = renderHook(() => useTodos());
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

    expect(mockApi.updateTodo).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveToggle(todo("1", "moloko", true));
    });
    await waitFor(() => expect(result.current.pendingId).toBeNull());
    expect(result.current.todos[0].completed).toBe(true);
  });
});
