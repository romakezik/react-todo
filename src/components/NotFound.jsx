import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="container">
            <h1>404</h1>
            <p>Такой страницы нет</p>
            <Link to="/" className="btn btn-primary">На главную</Link>
        </div>
    );
}