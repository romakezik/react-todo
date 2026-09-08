import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";

function RegisterForm() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        try {
            register(name, email, password);
            navigate('/');
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Имя</label>
                <input
                    className="form-input"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                    }}
                />
            </div>
            <div className="form-group">
                <label>Почта</label>
                <input
                    className="form-input"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                />
            </div>
            <div className="form-group">
                <label>Пароль</label>
                <input
                    className="form-input"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                />
            </div>
            <p className='form-error'>{error}</p>
            <button className="btn btn-primary" type="submit">
                Зарегистрироваться
            </button>
        </form>
    );
}

export default RegisterForm;