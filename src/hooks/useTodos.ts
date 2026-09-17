import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Todo } from "../types/types";

function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchTodos() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (error) setError(error.message);
      else setTodos(data ?? []);
      setLoading(false);
    }

    fetchTodos();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addTodo = async (text: string) => {
    const t = text.trim();
    if (!t || !userId) return;
    setActionError(null);

    const optimistic: Todo = {
      id: crypto.randomUUID(),
      user_id: userId,
      text: t,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTodos((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: userId, text: t })
      .select()
      .single();

    if (error) {
      setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
      setActionError(error.message);
      return;
    }

    setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? data : t)));
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
      const { data, error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, completed: todo.completed } : t,
          ),
        );
        setActionError(error.message);
        return;
      }
      setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
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
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) {
        setTodos((prev) => {
          const copy = [...prev];
          copy.splice(index, 0, target);
          return copy;
        });
        setActionError(error.message);
      }
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
      const { error } = await supabase
        .from("todos")
        .update({ text: trimmed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, text: target?.text } : t)),
        );
        setActionError(error.message);
      }
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
