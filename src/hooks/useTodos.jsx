import { useState } from "react";

function loadTodos(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`todos_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function useTodos(userId) {
  const [todos, setTodos] = useState(() => loadTodos(userId));
  const [prevUserId, setPrevUserId] = useState(userId);

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setTodos(loadTodos(userId));
  }

  const update = (makeNext) => {
    setTodos((prev) => {
      const next = makeNext(prev);
      if (userId) localStorage.setItem(`todos_${userId}`, JSON.stringify(next));
      return next;
    });
  };

  const addTodo = (text) => {
    const t = text.trim();
    if (!t) return;
    update((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: t, completed: false },
    ]);
  };

  const toggleTodo = (id) => {
    update((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const deleteTodo = (id) => {
    update((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    update((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
    );
  };

  return { todos, addTodo, toggleTodo, deleteTodo, editTodo };
}

export default useTodos;
