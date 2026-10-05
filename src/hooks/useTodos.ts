import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Todo } from "../types/types";

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchTodos() {
      setLoading(true);
      setError(null);

      try {
        const data = await api.getTodos();
        if (cancelled) return;
        setTodos(data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTodos();
    return () => {
      cancelled = true;
    };
  }, []);

  const addTodo = async (text: string) => {
    const t = text.trim();
    if (!t || pendingId) return;
    setActionError(null);
    setPendingId("add");

    try {
      const data = await api.createTodo(t);
      setTodos((prev) => [data, ...prev]);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setPendingId(null);
    }
  };

  const toggleTodo = async (id: string) => {
    if (pendingId) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    const next = !todo.completed;

    setActionError(null);
    setPendingId(id);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: next } : t)),
    );

    try {
      const data = await api.updateTodo(id, { completed: next });
      setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: todo.completed } : t,
        ),
      );
      setActionError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setPendingId(null);
    }
  };

  const deleteTodo = async (id: string) => {
    if (pendingId) return;
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return;
    const target = todos[index];

    setActionError(null);
    setPendingId(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.deleteTodo(id);
    } catch (e) {
      setTodos((prev) => {
        const copy = [...prev];
        copy.splice(index, 0, target);
        return copy;
      });
      setActionError(e instanceof Error ? e.message : "Не удалось удалить");
    } finally {
      setPendingId(null);
    }
  };

  const editTodo = async (id: string, text: string) => {
    if (pendingId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const target = todos.find((t) => t.id === id);
    if (!target || target.text === trimmed) return;

    setActionError(null);
    setPendingId(id);

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
    );

    try {
      const data = await api.updateTodo(id, { text: trimmed });
      setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, text: target.text } : t)),
      );
      setActionError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setPendingId(null);
    }
  };

  return {
    todos,
    loading,
    error,
    actionError,
    pendingId,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  } as const;
}

export default useTodos;
