import useTodos from "../hooks/useTodos";
import { useState, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

function Home() {
  const {
    todos,
    loading,
    error,
    actionError,
    pendingId,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
  } = useTodos();

  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const escapeRef = useRef(false);

  const filteredTodos =
    filter === "all"
      ? todos
      : filter === "active"
        ? todos.filter((t) => !t.completed)
        : todos.filter((t) => t.completed);

  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const remaining = total - completed;

  return (
    <div className="container">
      <h1 className="page-title">Ваши задачи</h1>

      <form
        className="add-form"
        onSubmit={(e) => {
          e.preventDefault();
          addTodo(text);
          setText("");
        }}
      >
        <input
          className="add-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          placeholder="Что нужно сделать?"
          aria-label="Новая задача"
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={pendingId !== null || !text.trim()}
        >
          Добавить
        </button>
      </form>

      <div className="filters-wrapper">
        <div className="filter-group">
          <button
            type="button"
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Все
            <span className="filter-count">{total}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "active" ? "active" : ""}`}
            onClick={() => setFilter("active")}
          >
            Активные
            <span className="filter-count">{remaining}</span>
          </button>
          <button
            type="button"
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Выполненные
            <span className="filter-count">{completed}</span>
          </button>
        </div>
        <span className="todo-count">Осталось: {remaining}</span>
      </div>

      {actionError && (
        <div className="form-error">Не удалось сохранить: {actionError}</div>
      )}

      {loading ? (
        <div className="empty-message">Загружаем задачи…</div>
      ) : error ? (
        <div className="empty-message">Ошибка загрузки: {error}</div>
      ) : todos.length === 0 ? (
        <div className="empty-message">Пока ничего нет</div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-message">В этой категории пусто</div>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? "is-done" : ""}`}
            >
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                disabled={pendingId !== null}
                aria-label={
                  todo.completed ? "Вернуть задачу" : "Отметить задачу"
                }
              />

              {editingId === todo.id ? (
                <TextareaAutosize
                  autoFocus
                  className="todo-edit-input"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => {
                    if (escapeRef.current) {
                      escapeRef.current = false;
                    } else if (editText.trim()) {
                      editTodo(todo.id, editText);
                    }
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                    if (e.key === "Escape") {
                      e.preventDefault();
                      escapeRef.current = true;
                      e.currentTarget.blur();
                    }
                  }}
                />
              ) : (
                <span
                  className="todo-text"
                  title="Двойной клик — редактировать"
                  onDoubleClick={() => {
                    if (editingId === todo.id) return;
                    setEditingId(todo.id);
                    setEditText(todo.text);
                  }}
                >
                  {todo.text}
                </span>
              )}

              <button
                className="todo-delete"
                onClick={() => deleteTodo(todo.id)}
                disabled={pendingId !== null}
                aria-label="Удалить задачу"
                title="Удалить"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
