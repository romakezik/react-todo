import { useAuth } from '../hooks/useAuth';
import useTodos from "../hooks/useTodos"
function Profile() {
    const { user, deleteProfile } = useAuth()
    const { todos } = useTodos(user?.id)
    return (
        <div className="container">
            <h1>Ваш профиль</h1>
            <div className="profile-card">
                <h2>Данные профиля</h2>
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Почта:</strong> {user.email}</p>
                <div className="profile-stats">
                    <span>Выполнено: {todos.filter(t => t.completed).length}</span>
                    <span>Всего задач: {todos.length}</span>
                    <span>Осталось: {todos.filter(t => !t.completed).length}</span>
                </div>
            </div>
            <div className="profile-card">
                <h1>Удалить профиль</h1>
                <button className="btn btn-danger" onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить профиль?')) {
                        deleteProfile();
                    }
                }}>Удалить</button>
            </div>
        </div>
    )
}
export default Profile