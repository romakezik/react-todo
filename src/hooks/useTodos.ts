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

    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: userId, text: t })
      .select()
      .single();

    if (error) {
      setActionError(error.message);
      return;
    }
    setTodos((prev) => [data, ...prev]);
  };

  const toggleTodo = async (id: string) => {
    if (pendingId) return;
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    setActionError(null);
    setPendingId(id);
    try {
      const { data, error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        setActionError(error.message);
        return;
      }
      setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
    } finally {
      setPendingId(null);
    }
  };

  const deleteTodo = async (id: string) => {
    setActionError(null);

    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      setActionError(error.message);
      return;
    }
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setActionError(null);

    const { data, error } = await supabase
      .from("todos")
      .update({ text: trimmed })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      setActionError(error.message);
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
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
