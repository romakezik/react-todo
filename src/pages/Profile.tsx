import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import useTodos from "../hooks/useTodos";
function Profile() {
  const { user, deleteProfile } = useAuth();
  const { todos, loading } = useTodos();
  const [deleteError, setDeleteError] = useState("");

  return (
    <div className="container">
      <h1>Ваш профиль</h1>
      <div className="profile-card">
        {user ? (
          <>
            <h2>Данные профиля</h2>
            <p>
              <strong>Имя:</strong> {user.name}
            </p>
            <p>
              <strong>Почта:</strong> {user.email}
            </p>
          </>
        ) : null}

        {loading ? (
          <div className="profile-stats">
            <span>…</span>
            <span>…</span>
            <span>…</span>
          </div>
        ) : (
          <div className="profile-stats">
            <span>Выполнено: {todos.filter((t) => t.completed).length}</span>
            <span>Всего задач: {todos.length}</span>
            <span>Осталось: {todos.filter((t) => !t.completed).length}</span>
          </div>
        )}
      </div>
      <div className="profile-card">
        <h2>Удалить профиль</h2>
        <button
          className="btn btn-danger"
          onClick={async () => {
            if (!window.confirm("Вы уверены, что хотите удалить профиль?")) return;
            try {
              await deleteProfile();
            } catch (err) {
              setDeleteError(err instanceof Error ? err.message : "Не удалось удалить профиль");
            }
          }}
        >
          Удалить
        </button>
        {deleteError && <p className="form-error">{deleteError}</p>}
      </div>
    </div>
  );
}
export default Profile;
