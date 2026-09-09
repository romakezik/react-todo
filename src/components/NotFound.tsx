import { Link } from "react-router-dom";
import { JSX } from "react";

export default function NotFound(): JSX.Element {
  return (
    <div className="container">
      <h1>404</h1>
      <p>Такой страницы нет</p>
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </div>
  );
}
