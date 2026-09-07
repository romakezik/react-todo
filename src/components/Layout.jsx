import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <nav className="nav">
        <NavLink to="/" end>Главная</NavLink>
        {user && <NavLink to="/profile">Профиль</NavLink>}
        <div className="user-info">

          <span className="user-name">{user.name}</span>
          <button className=' nav-link'
            onClick={(e) => { logout(); }}>Выйти</button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;