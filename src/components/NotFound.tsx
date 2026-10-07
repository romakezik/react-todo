import { Link } from "react-router-dom";
import type { JSX } from "react";

export default function NotFound(): JSX.Element {
  return (
    <div className="container">
      <div className="empty-state">
        <h1 className="empty-state__code">404</h1>
        <p className="empty-state__text">Такой страницы нет</p>
        <Link to="/" className="btn btn-primary">
          На главную
        </Link>
      </div>
    </div>
  );
}
