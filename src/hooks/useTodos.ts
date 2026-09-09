import { useState } from "react";
import { Todo } from "../types";

function loadTodos(userId: string | undefined): Todo[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`todos_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos(userId));
  const [prevUserId, setPrevUserId] = useState(userId);

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setTodos(loadTodos(userId));
  }

  const update = (makeNext: (prev: Todo[]) => Todo[]) => {
    setTodos((prev) => {
      const next = makeNext(prev);
      if (userId) localStorage.setItem(`todos_${userId}`, JSON.stringify(next));
      return next;
    });
  };

  const addTodo = (text: string) => {
    if (!text) return;
    const t = text.trim();
    update((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: t, completed: false },
    ]);
  };

  const toggleTodo = (id: string) => {
    update((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id: string) => {
    update((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = (id: string, text: string) => {
    if (!text) return;
    const trimmed = text.trim();
    update((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
    );
  };

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo } as const;
}

export default useTodos;
