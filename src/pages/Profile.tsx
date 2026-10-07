import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import useTodos from "../hooks/useTodos";

function Profile() {
  const { user, deleteProfile } = useAuth();
  const { todos, loading } = useTodos();
  const [deleteError, setDeleteError] = useState("");

  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const remaining = total - completed;

  return (
    <div className="container">
      <h1 className="page-title">Ваш профиль</h1>

      <div className="profile-card">
        {user && (
          <>
            <h2>Данные профиля</h2>
            <p>
              <strong>Имя:</strong> {user.name}
            </p>
            <p>
              <strong>Почта:</strong> {user.email}
            </p>
          </>
        )}

        <div className="profile-stats">
          {loading ? (
            <>
              <span>…</span>
              <span>…</span>
              <span>…</span>
            </>
          ) : (
            <>
              <span>Выполнено: {completed}</span>
              <span>Всего задач: {total}</span>
              <span>Осталось: {remaining}</span>
            </>
          )}
        </div>
      </div>

      <div className="profile-card profile-card--danger">
        <h2>Удалить профиль</h2>
        <p>Действие необратимо: аккаунт и все задачи будут удалены.</p>
        <button
          className="btn btn-danger"
          onClick={async () => {
            if (!window.confirm("Вы уверены, что хотите удалить профиль?"))
              return;
            try {
              await deleteProfile();
            } catch (err) {
              setDeleteError(
                err instanceof Error
                  ? err.message
                  : "Не удалось удалить профиль",
              );
            }
          }}
        >
          Удалить профиль
        </button>
        {deleteError && <p className="form-error">{deleteError}</p>}
      </div>
    </div>
  );
}

export default Profile;
