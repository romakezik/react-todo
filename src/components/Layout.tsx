import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="nav">
        <NavLink to="/" end>
          Главная
        </NavLink>
        {user && <NavLink to="/profile">Профиль</NavLink>}

        <div className="user-info">
          {user && (
            <>
              <span className="user-name">{user.name}</span>
              <button className="nav-link" onClick={logout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
