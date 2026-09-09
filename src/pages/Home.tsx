import useTodos from "../hooks/useTodos";
import { useAuth } from "../hooks/useAuth";
import { useState, useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
function Home() {
  const { user } = useAuth();
  const { todos, addTodo, toggleTodo, deleteTodo, editTodo } = useTodos(
    user?.id,
  );
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const escapeRef = useRef(false);

  const filteredTodos =
    filter === "all"
      ? todos
      : filter === "active"
        ? todos.filter((todo) => !todo.completed)
        : todos.filter((todo) => todo.completed);

  return (
    <div className="container">
      <h1>Ваши задачи</h1>
      <div className="section">
        <h2>Добавить новую задачу</h2>
        <form
          className="form-group"
          onSubmit={(e) => {
            e.preventDefault();
            addTodo(text);
            setText("");
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder="Введите задачу"
          />
          <button type="submit">Добавить</button>
        </form>
      </div>

      <div className="section">
        <h2>Список задач</h2>
        <div className="filters-wrapper">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Все
            </button>
            <button
              className={`filter-btn ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Активные
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Выполненные
            </button>
          </div>
          <span className="todo-count">
            Осталось: {todos.filter((t) => !t.completed).length}
          </span>
        </div>
        {todos.length === 0 ? (
          <div className="card empty-message">Пока ничего нет</div>
        ) : filteredTodos.length === 0 ? (
          <div className="card empty-message">В этой категории пусто</div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <span
                  className={`todo-text ${todo.completed ? "completed" : ""}`}
                  onDoubleClick={() => {
                    if (editingId === todo.id) return;
                    setEditingId(todo.id);
                    setEditText(todo.text);
                  }}
                >
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
                    todo.text
                  )}
                </span>
                <div className="todo-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed ? "отменить" : "Отметить"}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label="Удалить задачу"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default Home;
